import admin from "firebase-admin";

// Initialize Firebase Admin with the same project as the frontend
// Using application default credentials or the project ID
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "potential-641e8",
  });
}

export const verifyGoogleToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Invalid Google token");
  }
};

export default admin;
