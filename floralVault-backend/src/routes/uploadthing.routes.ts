import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthingRouter";

export const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    callbackUrl: process.env.UPLOADTHING_CALLBACK_URL || "http://localhost:5000/api/uploadthing",
    token: process.env.UPLOADTHING_TOKEN,
  },
});
