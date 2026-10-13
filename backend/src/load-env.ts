try {
  process.loadEnvFile();
} catch {
  // .env may already be loaded or running in an environment with preset variables
}
