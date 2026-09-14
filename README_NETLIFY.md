# Lifetime Health Record — deployment notes

This build uses Netlify Functions and Netlify Blobs for the account/role backend.

## Important
Do **not** use Netlify Drop/manual drag-and-drop for this build. Deploy the repository through Netlify Continuous Deployment from GitHub (or Netlify CLI), so `netlify/functions` is deployed as serverless Functions.

The backend store name is intentionally `lhr-backend-first-account-superadmin-v2-fresh` so the first account created after this build is deployed becomes the only Super Admin. Every later account is a normal User unless the Super Admin promotes it to Admin.

After deployment, the backend health check is available at `/api/health`. A successful response has `functions: true`.

The optional `/api/send-patient-id` endpoint is included so registration does not fail because the SMS endpoint is missing. Real SMS delivery is not configured in this demo.
