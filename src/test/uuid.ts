export const generateUUID = (): string => {
  return crypto.randomUUID();
};

export const generateCUID = (): string => {
  // Generate a simple CUID-like format for testing
  // Real CUID format starts with 'c' and has specific structure
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'c';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};