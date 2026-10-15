import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'calendar' | 'bag' | 'clock' | 'chat' | 'tag' | 'megaphone'
  | 'image' | 'send' | 'back' | 'trash' | 'close' | 'check' | 'star';

type Props = { name: IconName; size?: number; color?: string; fill?: string; strokeWidth?: number };

export function Icon({ name, size = 24, color = '#2A1A2E', fill = 'none', strokeWidth = 1.8 }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'home' && <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" {...common} />}
      {name === 'calendar' && (<><Rect x={3} y={5} width={18} height={16} rx={2} {...common} /><Path d="M3 10h18M8 3v4M16 3v4" {...common} /></>)}
      {name === 'bag' && (<><Path d="M5 8h14l-1 12H6z" {...common} /><Path d="M9 8V6a3 3 0 0 1 6 0v2" {...common} /></>)}
      {name === 'clock' && (<><Circle cx={12} cy={12} r={9} {...common} /><Path d="M12 7v5l3 2" {...common} /></>)}
      {name === 'chat' && <Path d="M4 5h16v11H9l-5 4z" {...common} />}
      {name === 'tag' && (<><Path d="M3 12V4h8l10 10-8 8z" {...common} /><Circle cx={7.5} cy={7.5} r={1.5} {...common} /></>)}
      {name === 'megaphone' && (<><Path d="M3 10v4h4l8 5V5L7 10z" {...common} /><Path d="M18 9a4 4 0 0 1 0 6" {...common} /></>)}
      {name === 'image' && (<><Rect x={3} y={4} width={18} height={16} rx={2} {...common} /><Circle cx={9} cy={10} r={2} {...common} /><Path d="M21 16l-5-5-9 9" {...common} /></>)}
      {name === 'send' && <Path d="M4 12l16-8-6 16-3-7z" {...common} />}
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...common} strokeWidth={2} />}
      {name === 'trash' && <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" {...common} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...common} strokeWidth={2} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7" {...common} strokeWidth={2.2} />}
      {name === 'star' && <Path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" {...common} fill={fill} />}
    </Svg>
  );
}
