// Verify Firebase ID tokens
// Firebase ID tokens are JWTs that can be verified using Google's public keys

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const FIREBASE_PROJECT_ID = "my-floralvault";

// JWKS client to fetch Google's public keys for Firebase token verification
const client = jwksClient({
  jwksUri: "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

interface FirebaseTokenPayload {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
  };
}

export const verifyGoogleToken = async (idToken: string): Promise<{
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
        audience: FIREBASE_PROJECT_ID,
      },
      (err, decoded) => {
        if (err) {
          console.error("Token verification error:", err);
          reject(new Error("Invalid Google token"));
          return;
        }

        const payload = decoded as FirebaseTokenPayload;
        
        resolve({
          uid: payload.sub || payload.user_id,
          email: payload.email || "",
          name: payload.name,
          picture: payload.picture,
        });
      }
    );
  });
};
