import { GoogleAuth } from "google-auth-library";
import { captureException } from "@sentry/nextjs";

export async function getAuthToken(scope = "calendar") {
  try {
    const auth = new GoogleAuth({
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: [`https://www.googleapis.com/auth/${scope}`],
    });

    const authToken = await auth.getClient();
    const accessToken = await authToken.getAccessToken();
    const { token } = accessToken;

    return token;
  } catch (err) {
    const errorMessage = `Error occurred in getAuthToken function while requesting scope '${scope}': ${err.message}`;
    console.error(errorMessage);
    captureException(new Error(errorMessage));
    throw new Error(errorMessage);
  }
}
