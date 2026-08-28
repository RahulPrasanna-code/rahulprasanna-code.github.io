# Rahul Prasanna Portfolio

The static portfolio is deployed through GitHub Pages. The interactive portfolio assistant lives in `worker/` and calls Gemini server-side so the Gemini API key is never shipped to the browser.

## Deployment

1. Create a Cloudflare Worker and install Wrangler locally with `npm install -g wrangler`, or use the included GitHub Actions workflow.
2. Add `GEMINI_API_KEY`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets. Never commit the Gemini key or put it in `index.html`.
3. Deploy the Worker from `worker/` with `npx wrangler deploy`.
4. Copy the deployed Worker URL into `index.html` by setting `window.PORTFOLIO_ASSISTANT_API` before the assistant script, or map the Worker to `/api/chat` through your hosting platform.

The Worker includes origin allowlisting, input length validation, a portfolio-grounded system prompt, low temperature, and a capped output length. Add rate limiting before public launch if traffic is expected.
