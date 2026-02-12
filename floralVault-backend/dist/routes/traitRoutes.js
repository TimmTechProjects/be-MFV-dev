"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const traitController_1 = require("../controllers/traitController");
const router = (0, express_1.Router)();
router.get("/", traitController_1.getTraits);
router.get("/grouped", traitController_1.getTraitsGrouped);
exports.default = router;
