/** Obsolete IANA names still emitted by some OS/browsers (notably Windows). */
const TIMEZONE_ALIASES: Record<string, string> = {
    'Asia/Calcutta': 'Asia/Kolkata',
    'Asia/Saigon': 'Asia/Ho_Chi_Minh',
    'Asia/Katmandu': 'Asia/Kathmandu',
    'Atlantic/Faeroe': 'Atlantic/Faroe',
    'Europe/Kiev': 'Europe/Kyiv',
};

/** Map legacy timezone names to ones Postgres tzdata recognizes. */
export function normalizeTimezone(tz: string | undefined | null, fallback = 'UTC'): string {
    if (!tz || !tz.trim()) return fallback;
    const trimmed = tz.trim();
    return TIMEZONE_ALIASES[trimmed] ?? trimmed;
}
