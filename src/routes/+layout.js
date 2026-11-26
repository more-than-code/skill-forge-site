// No client JavaScript: every page is rendered once at build time (as in the Deploybot and
// Defect Drainer sites).
export const prerender = true;
export const csr = false;
export const trailingSlash = 'never';
