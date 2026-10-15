/*
 * dc-lite.js — a tiny runtime that renders the GlamWithJeni design files
 * (design/*.dc.html) as standalone pages, using Preact for DOM diffing.
 *
 * Supported template syntax (the subset the design files use):
 *   {{ path }}            dotted lookup into renderVals() (text and attributes)
 *   attr="{{ path }}"     raw value (functions, booleans, numbers)
 *   <sc-if value="{{x}}"> render children when x is truthy
 *   <sc-for list="{{xs}}" as="item">  repeat children, with item and $index in scope
 *   <helmet>              its <link>/<style> children are moved into <head>
 * The logic script defines `class Component extends DCLogic { renderVals() {...} }`.
 */
(function () {
  'use strict';
  var preact = window.preact;
  var h = preact.h;
  var Fragment = preact.Fragment;
  var schedule = function () {};

  function DCLogic(props) {
    this.props = props || {};
    this.state = {};
  }
  DCLogic.prototype.setState = function (update) {
    var patch = typeof update === 'function' ? update(this.state, this.props) : update;
    this.state = Object.assign({}, this.state, patch);
    schedule();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };
  window.DCLogic = DCLogic;

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  function interpolate(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      return v == null ? '' : String(v);
    });
  }
  function attrValue(str, scope) {
    var m = str.match(WHOLE);
    return m ? lookup(scope, m[1]) : interpolate(str, scope);
  }

  function children(node, scope) {
    var out = [];
    node.childNodes.forEach(function (c) {
      var r = build(c, scope);
      if (r !== null && r !== undefined) out.push(r);
    });
    return out;
  }

  function build(node, scope) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (/^\s*$/.test(t) && t.indexOf('\n') !== -1) return null;
      return interpolate(t, scope);
    }
    if (node.nodeType !== 1) return null;
    var tag = node.localName;
    if (tag === 'helmet') return null;
    if (tag === 'sc-if') {
      return attrValue(node.getAttribute('value') || '', scope) ? h(Fragment, null, children(node, scope)) : null;
    }
    if (tag === 'sc-for') {
      var list = attrValue(node.getAttribute('list') || '', scope) || [];
      var as = node.getAttribute('as') || 'item';
      return h(Fragment, null, list.map(function (item, i) {
        var inner = Object.create(scope);
        inner[as] = item;
        inner.$index = i;
        return h(Fragment, { key: i }, children(node, inner));
      }));
    }
    var props = {};
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      var name = a.name;
      if (name.indexOf('hint-') === 0) continue;
      var value = attrValue(a.value, scope);
      if (name.indexOf('on') === 0) {
        name = name.toLowerCase();
        var type = (node.getAttribute('type') || 'text').toLowerCase();
        // React-style onChange on text fields fires per keystroke: map it to input events.
        if (name === 'onchange' && (tag === 'textarea' || (tag === 'input' && type !== 'file' && type !== 'checkbox' && type !== 'radio'))) name = 'oninput';
        if (typeof value !== 'function') continue;
      } else if (name === 'disabled' || name === 'checked' || name === 'readonly') {
        value = !!value && value !== 'false';
      }
      props[name] = value;
    }
    return h(tag, props, children(node, scope));
  }

  function boot() {
    var tpl = document.getElementById('dc');
    if (!tpl) return;
    tpl.content.querySelectorAll('helmet').forEach(function (hm) {
      Array.prototype.slice.call(hm.childNodes).forEach(function (c) {
        if (c.nodeType === 1) document.head.appendChild(document.importNode(c, true));
      });
    });
    var scriptEl = document.querySelector('script[data-dc-script]');
    var Component = new Function('DCLogic', scriptEl.textContent + '\nreturn Component;')(DCLogic);
    var props = {};
    try {
      var declared = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
      Object.keys(declared).forEach(function (k) {
        if (k.charAt(0) !== '$' && declared[k] && 'default' in declared[k]) props[k] = declared[k].default;
      });
    } catch (e) { /* no declared props */ }

    var inst = new Component(props);
    var host = document.createElement('div');
    host.id = 'dc-root';
    document.body.appendChild(host);

    function draw() {
      var scope = Object.assign({}, inst.renderVals());
      preact.render(h(Fragment, null, children(tpl.content, scope)), host);
    }
    var queued = false;
    schedule = function () {
      if (queued) return;
      queued = true;
      Promise.resolve().then(function () { queued = false; draw(); });
    };
    draw();
    if (typeof inst.componentDidMount === 'function') inst.componentDidMount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
