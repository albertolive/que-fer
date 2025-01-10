import { GoogleAuth, OAuth2Client } from "google-auth-library";
import { captureException } from "@sentry/nextjs";

interface GoogleCredentials {
  client_id: string | undefined;
  client_email: string | undefined;
  project_id: string | undefined;
  private_key: string | undefined;
}

/**
 * Gets an authentication token for Google APIs.
 * 
 * @param {string} scope - The scope for which to request access (e.g., 'calendar', 'webmasters.readonly')
 * @returns {Promise<string>} The access token
 * @throws {Error} If authentication fails or required environment variables are missing
 */
export async function getAuthToken(scope: string = "calendar"): Promise<string> {
  try {
    const credentials: GoogleCredentials = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    };

    // Validate required credentials
    const missingCredentials = Object.entries(credentials)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingCredentials.length > 0) {
      throw new Error(
        `Missing required Google credentials: ${missingCredentials.join(", ")}`
      );
    }

    const auth = new GoogleAuth({
      credentials: credentials as Required<GoogleCredentials>,
      scopes: [`https://www.googleapis.com/auth/${scope}`],
    });

    const authToken: OAuth2Client = await auth.getClient() as OAuth2Client;
    const accessToken = await authToken.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error("Failed to obtain access token");
    }

    return accessToken.token;
  } catch (err: any) {
    const errorMessage = `Error occurred in getAuthToken function while requesting scope '${scope}': ${err.message}`;
    console.error(errorMessage);
    captureException(new Error(errorMessage));
    throw new Error(errorMessage);
  }
}
