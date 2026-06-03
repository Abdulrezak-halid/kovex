# Browser Security Review

## XSS Review

- React escapes rendered text by default, and application pages render user data through JSX text nodes.
- No application page uses `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`, `eval`, or `new Function`.
- The only `dangerouslySetInnerHTML` occurrence is in `packages/front/src/components/ui/chart.tsx`, inherited from the chart UI helper. It injects CSS custom-property rules from local chart configuration, not user-entered HTML.
- External documentation links open with `target="_blank"` and `rel="noreferrer"`.
- Continue avoiding rich HTML fields unless a sanitizer such as DOMPurify is added at the rendering boundary.

## CSRF Review

- Authentication uses an HTTP-only session cookie named `sme_erp_session`.
- The cookie is configured with `SameSite=Lax`, `path=/`, and `secure` in production.
- API writes are protected by authentication and backend role checks.
- The frontend uses JSON `fetch` requests with credentials included; no state-changing behavior is implemented through GET endpoints.
- For higher-risk production deployments, add a per-session CSRF token header, for example a double-submit `X-CSRF-Token` value, especially if cross-site embedding or legacy browser support becomes a requirement.

## Validation Review

- Backend routes should validate request bodies, params, and query strings with schemas generated from `packages/api-contract/openapi.yaml`.
- User create/update now extends the generated user schemas with the password field required by authentication.
- Invalid input returns `400` with a safe `error` string and structured `details` where schema issues are available.
