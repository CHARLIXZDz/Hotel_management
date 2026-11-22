/**
 * Date Formatting Utility for Grand Horizon Hotel & Resort
 * Standardizes all date formats to DD/MM/YYYY across the entire application
 */

export const formatDateDDMMYY = (dateString, shortYear = false) => {
  if (!dateString) return '';
  
  // If it's already an ISO string like "2026-11-23" or "2026-11-23T00:00:00.000Z"
  const clean = String(dateString).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const y = shortYear ? year.slice(-2) : year;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${y}`;
  }

  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = shortYear ? String(d.getFullYear()).slice(-2) : String(d.getFullYear());

  return `${day}/${month}/${year}`;
};

export const formatDate = formatDateDDMMYY;

export default {
  formatDateDDMMYY,
  formatDate
};
