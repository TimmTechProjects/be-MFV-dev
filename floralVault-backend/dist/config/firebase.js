"use strict";
// Verify Firebase ID tokens
// Firebase ID tokens are JWTs that can be verified using Google's public keys
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const FIREBASE_PROJECT_ID = "my-floralvault";
// JWKS client to fetch Google's public keys for Firebase token verification
const client = (0, jwks_rsa_1.default)({
    jwksUri: "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
});
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}
const verifyGoogleToken = async (idToken) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(idToken, getKey, {
            algorithms: ["RS256"],
            issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
            audience: FIREBASE_PROJECT_ID,
        }, (err, decoded) => {
            if (err) {
                console.error("Token verification error:", err);
                reject(new Error("Invalid Google token"));
                return;
            }
            const payload = decoded;
            resolve({
                uid: payload.sub || payload.user_id,
                email: payload.email || "",
                name: payload.name,
                picture: payload.picture,
            });
        });
    });
};
exports.verifyGoogleToken = verifyGoogleToken;
