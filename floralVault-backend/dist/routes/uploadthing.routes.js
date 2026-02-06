"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadthingHandler = void 0;
const express_1 = require("uploadthing/express");
const uploadthingRouter_1 = require("./uploadthingRouter");
exports.uploadthingHandler = (0, express_1.createRouteHandler)({
    router: uploadthingRouter_1.ourFileRouter,
    config: {
        callbackUrl: "http://localhost:5000/api/uploadthing",
        token: process.env.UPLOADTHING_TOKEN,
    },
});
