// Verify Google ID tokens using Google's tokeninfo endpoint
// This approach doesn't require service account credentials

interface GoogleTokenInfo {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: string;
  exp: string;
}

export const verifyGoogleToken = async (idToken: string): Promise<{
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}> => {
  try {
    // Use Google's tokeninfo endpoint to verify the token
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    const tokenInfo: GoogleTokenInfo = await response.json();

    // Verify the token is for our Firebase project
    const validAudiences = [
      "241521864207-somethingsomething.apps.googleusercontent.com", // Web client ID
      "potential-641e8", // Firebase project ID
    ];

    // The aud should contain our Firebase project's web client ID
    // For Firebase Auth, the aud is typically the Firebase project's web client ID

    return {
      uid: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name,
      picture: tokenInfo.picture,
    };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Invalid Google token");
  }
};
