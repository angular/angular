// Functions
export const getEnvVar = (name: string, isOptional = false): string => {
  const value = process.env[name];

  if (!isOptional && !value) {
    console.error(`ERROR: Missing required environment variable '${name}'!`);
    process.exit(1);
  }

  return value || '';
};
