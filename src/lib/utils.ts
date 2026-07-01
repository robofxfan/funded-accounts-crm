export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export function monthName(n: number) { return MONTHS[n - 1] ?? ''; }

export function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function currentYear() { return new Date().getFullYear(); }
export function currentMonth() { return new Date().getMonth() + 1; }

export function yearRange() {
  const y = currentYear();
  return Array.from({ length: 5 }, (_, i) => y - 2 + i);
}
