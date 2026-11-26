// Build-time gate flags, each "0" (default) or "1"; anything else fails the build. A gated claim is
// absent from the output while its flag is off, so the site states only what is live (the
// Defect Drainer site's rule). Read by +layout.server.js only, at build time.

/** @param {string} name */
function flag(name) {
	const value = process.env[name] ?? '0';
	if (value !== '0' && value !== '1') throw new Error(`${name} must be 0 or 1, got ${JSON.stringify(value)}`);
	return value === '1';
}

/** The portal accepts sign-ins: shows Sign in and Get started. */
export const PORTAL_LIVE = flag('PORTAL_LIVE');
