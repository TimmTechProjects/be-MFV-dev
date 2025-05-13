import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthingRouter";

export const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    callbackUrl: "http://localhost:5000/api/uploadthing",
    token: process.env.UPLOADTHING_TOKEN,
  },
});
