"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLimiter = exports.publicApiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Public API Rate Limiter
 *
 * Limits: 100 requests per minute per IP
 * Applied to: Forum threads, post listings, and other public endpoints
 */
exports.publicApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '60 seconds',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '60 seconds',
        });
    },
});
/**
 * Search/Expensive Query Rate Limiter
 *
 * Limits: 30 requests per minute per IP
 * Applied to: Search endpoints and other expensive operations
 */
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute per IP
    message: {
        error: 'Too many search requests, please try again later.',
        retryAfter: '60 seconds',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many search requests, please try again later.',
            retryAfter: '60 seconds',
        });
    },
});
