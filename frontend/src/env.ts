// export const env = {
//   apiBaseUrl: "http://localhost:3000" + "/api/v1",
//   appName: import.meta.env.VITE_APP_NAME ?? "ShortShout",
//   appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
// } as const;

/**
 * Typed environment variables.
 * Access all env vars through this module — never import.meta.env directly.
 */
const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "",
  appEnv: import.meta.env.MODE as "development" | "production" | "test",
  baseUrl: import.meta.env.BASE_URL as string,
  isDev: import.meta.env.DEV as boolean,
  isProd: import.meta.env.PROD as boolean,
} as const;

export default env;
