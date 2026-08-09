import cors from 'cors';

function appUrlOrigin(): string | null {
    const raw = process.env.APP_URL?.trim();
    if (!raw) return null;
    try {
        return new URL(raw).origin;
    } catch {
        return null;
    }
}

const allow = new Set([
    ...(process.env.CORS_REMOVE_DEFAULT_ALLOWED_ORIGINS === 'true' ? [] : [
        'https://app.taskview.tech',
        'https://taskview.handscream.com',
        'capacitor://taskview.handscream.com',
        'capacitor://app.taskview.tech',
        'https://appleid.apple.com',
    ]),
    ...(process.env.CORS_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) || []),
]);

const configuredAppOrigin = appUrlOrigin();
if (configuredAppOrigin) {
    allow.add(configuredAppOrigin);
}

const allowAllOrigins = allow.has('*');
const allowVercelApps = process.env.CORS_ALLOW_VERCEL === 'true';
const vercelOriginPattern = /^https:\/\/[\w.-]+\.vercel\.app$/;

function isAllowedOrigin(origin: string): boolean {
    if (allowAllOrigins || allow.has(origin)) return true;
    if (allowVercelApps && vercelOriginPattern.test(origin)) return true;
    return false;
}

export const corsMiddleware = cors({
    credentials: true,
    maxAge: 600,
    origin(origin, cb) {
        if (!origin || origin === 'null') return cb(null, true);
        if (isAllowedOrigin(origin)) return cb(null, true);
        return cb(null, false);
    },
});
