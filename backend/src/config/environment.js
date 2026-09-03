const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

/**
 * Parse command-line arguments to find the --env flag
 * @returns {string} Path to the .env file
 */
function getEnvFilePath() {
  const args = process.argv.slice(2); // Skip 'node' and script name
  const envIndex = args.indexOf("--env");

  // If --env flag is provided, use the next argument as the file path
  if (envIndex !== -1 && envIndex + 1 < args.length) {
    return args[envIndex + 1];
  }

  // Default to .env if no --env argument is passed
  return ".env";
}

/**
 * Load environment variables from the specified .env file
 */
function loadEnvironment() {
  const envFile = getEnvFilePath();
  const envPath = path.resolve(process.cwd(), envFile);

  console.log(`🔍 Loading environment variables from: ${envPath}`);

  // Check if the file exists
  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Environment file not found: ${envPath}`);
    console.warn(`   Falling back to .env`);
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  } else {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.error(
        `❌ Error loading environment file: ${envFile}`,
        result.error,
      );
      process.exit(1);
    }
    console.log(`✅ Loaded environment from: ${envFile}`);
  }
}

/**
 * Validate required environment variables
 * @param {string[]} requiredVars - List of required environment variable names
 */
function validateRequiredEnvVars(requiredVars = []) {
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}

module.exports = {
  loadEnvironment,
  getEnvFilePath,
  validateRequiredEnvVars,
};
