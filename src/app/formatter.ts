export const formatAmount = (value: number) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
export const formatDate =(dateStr: string) => {
  if (typeof dateStr !== 'string') return null; // xatolikdan saqlanish
  const parts = dateStr.split('-'); // ["2025", "10", "02"]
  if (parts.length !== 3) return null; // noto‘g‘ri format bo‘lsa

  const [year, month, day] = parts;
  return `${day}.${month}.${year}`; // "02.10.2025"
}
