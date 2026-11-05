<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Provider and admin dashboards live under the authenticated pathless layout while preserving /provider and /admin URLs; this keeps private loaders behind the session gate.
- Dashboard reads and mutations use authenticated server functions and user-scoped RLS clients; every admin operation additionally validates the stored admin role.
- Dashboard business validation and accounting calculations live in dashboard-rules with focused tests; completed requests alone contribute earned revenue.

- Customer catalog reads use a public publishable server client; customer mutations and private tracking use authenticated server functions with explicit customer scoping, so the shared dashboard records remain authoritative.
- Customer orders and notifications live under the authenticated pathless layout; cart and store pages remain public with inline sign-in for submissions.

- AI recommendations use authenticated server functions, streamed structured Responses calls, and server-side catalog-ID grounding; only active catalog stores in the selected area may appear.
- Gateway provider denials persist in a service-role-only access-state table; recovery requires access restoration and explicit owner clearance before fresh requests.
- Delivery and fleet management pages live under the authenticated layout and use existing delivery server functions; fleet mutations retain server-side admin checks and wallet totals remain accounting records.
- Navigation uses intent preloading and cached dashboard reads with background revalidation; public catalog lists exclude products/reviews, while store details, provider products, and order items use separate scoped queries to keep opening pages lightweight without truncating the earnings ledger.
- Web push uses a dedicated Firebase messaging worker without app-shell caching; authenticated registration and test sends target only the caller's stored device token through the connector gateway.
