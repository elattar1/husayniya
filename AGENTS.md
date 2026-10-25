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
