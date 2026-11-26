#!/bin/sh
# Deploy site/build to the Cloudflare Pages project skill-forge-site (site/README.md), the same way
# the Deploybot site deploys. Run it on Joe's yes for each production deploy.
#
#   sh scripts/deploy.sh                 preview deploy (branch "preview")
#   BRANCH=main sh scripts/deploy.sh     production deploy (HEAD must already be on origin/dev)
#   DRY_RUN=1 sh scripts/deploy.sh       every step except the upload; reads no credentials
#
# The API token is read only from ~/.config/skill-forge/cloudflare-pages-token (mode 600) and is never
# printed. The account id (not a secret) comes from CLOUDFLARE_ACCOUNT_ID or
# ~/.config/skill-forge/cloudflare-account-id. A dirty tree is refused, before the gates and again just
# before the upload, so every deploy traces to a commit. DRY_RUN and ALLOW_DIRTY_FOR_TEST take 0 or 1
# (default 0); ALLOW_DIRTY_FOR_TEST=1 skips the clean-tree checks, and only together with DRY_RUN=1.
set -eu

PROJECT=skill-forge-site
BRANCH="${BRANCH:-preview}"
DRY_RUN="${DRY_RUN-0}"
ALLOW_DIRTY_FOR_TEST="${ALLOW_DIRTY_FOR_TEST-0}"
TOKEN_FILE="$HOME/.config/skill-forge/cloudflare-pages-token"
ACCOUNT_FILE="$HOME/.config/skill-forge/cloudflare-account-id"

fail() {
	echo "deploy: $*" >&2
	exit 1
}

case "$DRY_RUN" in
	0 | 1) ;;
	*) fail "DRY_RUN must be 0 or 1" ;;
esac
case "$ALLOW_DIRTY_FOR_TEST" in
	0 | 1) ;;
	*) fail "ALLOW_DIRTY_FOR_TEST must be 0 or 1" ;;
esac

SITE_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$SITE_DIR"

case "$BRANCH" in
	'' | -* | *[!a-z0-9-]*) fail "BRANCH must be lowercase letters, digits and hyphens (main for production)" ;;
esac

# What is uploaded is exactly the commit named by --commit-hash: a clean tree, and the same HEAD.
check_clean() {
	if [ "$DRY_RUN" = 1 ] && [ "$ALLOW_DIRTY_FOR_TEST" = 1 ]; then
		echo "deploy: dry run, dirty-tree check skipped (ALLOW_DIRTY_FOR_TEST=1)"
		return
	fi
	if [ -n "$(git status --porcelain)" ]; then
		fail "the working tree has uncommitted changes; commit or stash them first"
	fi
}

# 1. Clean tree.
check_clean
COMMIT=$(git rev-parse HEAD)
GIT_BRANCH=$(git branch --show-current)
GIT_BRANCH="${GIT_BRANCH:-detached HEAD}"

# 2. Production only ships a commit that is already on origin/dev (applies to dry runs too).
if [ "$BRANCH" = main ]; then
	git fetch -q origin dev || fail "could not fetch dev from origin"
	if ! git merge-base --is-ancestor "$COMMIT" origin/dev; then
		fail "BRANCH=main deploys only a commit already on origin/dev; $COMMIT is not (push it to dev first)"
	fi
fi

# 2b. Production never ships the placeholder domains (src/lib/links.ts) or a site without its portal flag
# decided: PORTAL_LIVE comes from the environment, so say it explicitly for production.
if [ "$BRANCH" = main ]; then
	if grep -qF 'skillforge.example' src/lib/links.ts; then
		fail "src/lib/links.ts still names the placeholder domain skillforge.example; set the real domains first"
	fi
	case "${PORTAL_LIVE-}" in
		0 | 1) ;;
		*) fail "set PORTAL_LIVE=0 or PORTAL_LIVE=1 explicitly for a production deploy" ;;
	esac
fi

# 3. Credentials, before the slow gates. A dry run reads none.
if [ "$DRY_RUN" = 0 ]; then
	[ -f "$TOKEN_FILE" ] || fail "missing $TOKEN_FILE (a Cloudflare Pages edit token; see site/README.md)"
	if [ -z "$(find "$TOKEN_FILE" -maxdepth 0 -perm 600)" ]; then
		fail "$TOKEN_FILE must be mode 600 (it is $(ls -ld "$TOKEN_FILE" | cut -c2-10))"
	fi
	token=$(tr -d '\r\n' <"$TOKEN_FILE")
	[ -n "$token" ] || fail "$TOKEN_FILE is empty"
	account="${CLOUDFLARE_ACCOUNT_ID:-}"
	if [ -z "$account" ] && [ -f "$ACCOUNT_FILE" ]; then
		account=$(tr -d ' \r\n' <"$ACCOUNT_FILE")
	fi
	[ -n "$account" ] || fail "set CLOUDFLARE_ACCOUNT_ID or write the account id to $ACCOUNT_FILE"
fi

# 4. Gates.
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm guard

# 5. Clean tree again: the gates must not have changed a tracked file, and HEAD must not have moved.
check_clean
[ "$(git rev-parse HEAD)" = "$COMMIT" ] || fail "HEAD moved during the gates (was $COMMIT); run the deploy again"

# 6. Upload.
if [ "$DRY_RUN" = 1 ]; then
	echo "deploy: dry run, not uploading commit $COMMIT ($GIT_BRANCH). Would run: pnpm exec wrangler pages deploy build --project-name $PROJECT --branch $BRANCH --commit-hash $COMMIT --commit-dirty=false"
	exit 0
fi
echo "deploy: uploading build/ to $PROJECT, branch $BRANCH, commit $COMMIT (git branch $GIT_BRANCH)"
CLOUDFLARE_API_TOKEN="$token" CLOUDFLARE_ACCOUNT_ID="$account" WRANGLER_SEND_METRICS=false \
	pnpm exec wrangler pages deploy build --project-name "$PROJECT" --branch "$BRANCH" \
	--commit-hash "$COMMIT" --commit-dirty=false
