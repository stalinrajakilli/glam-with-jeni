// Sample catalogue. Replace with Jeni's real services and products
// (these move to the `services` and `products` tables in Supabase).

export type Service = { id: string; name: string; duration: string; price: number };
export type Product = {
  id: string;
  name: string;
  shape: string;
  price: number;
  colors: { bg: string; nail: string; accent: string; edge: string };
};

export const SERVICES: Service[] = [
  { id: 'party', name: 'Party makeup', duration: '90 min', price: 2500 },
  { id: 'bridal', name: 'Bridal makeup trial', duration: '2 hr', price: 4000 },
  { id: 'gel', name: 'Gel manicure', duration: '45 min', price: 800 },
  { id: 'art', name: 'Nail art (full set)', duration: '60 min', price: 1200 },
  { id: 'ext', name: 'Gel extensions', duration: '90 min', price: 1800 },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Blush French', shape: 'Almond · 24 nails', price: 699, colors: { bg: '#F7E7EC', nail: '#F3D3DC', accent: '#FFFFFF', edge: '#E3BFCB' } },
  { id: 'p2', name: 'Midnight Chrome', shape: 'Coffin · 24 nails', price: 899, colors: { bg: '#E9E4EE', nail: '#2E2440', accent: '#5A4B78', edge: '#2E2440' } },
  { id: 'p3', name: 'Nude Ombré', shape: 'Square · 24 nails', price: 649, colors: { bg: '#F5ECE4', nail: '#E2C2A8', accent: '#F0DCCB', edge: '#CFA88A' } },
  { id: 'p4', name: 'Cherry Pop', shape: 'Short oval · 24 nails', price: 599, colors: { bg: '#FBE6E6', nail: '#B3202F', accent: '#D23A47', edge: '#951A27' } },
  { id: 'p5', name: 'Lilac Daisy', shape: 'Almond · 24 nails', price: 749, colors: { bg: '#EFE8F7', nail: '#C9B5E8', accent: '#E3D7F4', edge: '#AE97D6' } },
  { id: 'p6', name: 'Gold Leaf', shape: 'Stiletto · 24 nails', price: 999, colors: { bg: '#F6EEDC', nail: '#D7B56D', accent: '#F2E2B8', edge: '#B8944A' } },
];

export const SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

/** The next `count` days starting tomorrow, for the booking date picker. */
export function upcomingDays(count = 7, from = new Date()) {
  const days: { key: string; weekday: string; day: string; month: string; date: Date }[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: String(d.getDate()),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      date: d,
    });
  }
  return days;
}

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
