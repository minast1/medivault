export const formatGhanaCard = (input: string) => {
  // 1. Remove everything except letters and numbers
  const clean = input.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  // 2. Slice into the GHA-000000000-0 parts
  let formatted = clean;
  if (clean.length > 3) {
    formatted = `${clean.slice(0, 3)}-${clean.slice(3, 12)}`;
  }
  if (clean.length > 12) {
    formatted = `${formatted.slice(0, 13)}-${clean.slice(12, 13)}`;
  }

  return formatted.slice(0, 15); // Max length with hyphens is 15
};
