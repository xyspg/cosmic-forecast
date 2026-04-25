# Agent rules

## TanStack Router (file-based)

Routes live in `src/routes/` and use `.` for path separators, `$` for params:

- `index.tsx` → `/`
- `market.$slug.tsx` → `/market/:slug`

Each route file exports a local `Route = createFileRoute('/path')({...})`. All hooks hang off it (`Route.useParams()`, `Route.useSearch()`, `Route.useLoaderData()`) — that's where the type safety comes from. `routeTree.gen.ts` is auto-generated; commit it but never edit it.

`<Link>` requires structured params, not strings: `<Link to="/market/$slug" params={{ slug }} search={{ side: 'yes' }}>`. `useNavigate()` takes the same shape.

Search params are validated with zod via `validateSearch: schema` — invalid params get stripped, the typed result lands in `useSearch()`.

## Hono Worker

`src/worker/index.ts` is the only Worker entry. Bindings (`KV`, `OPENAI_*`) come through `c.env`, typed as `WorkerEnv` (see `lib/kv.ts`). Library code that needs env (e.g. `generateExplanation`) takes it as an explicit parameter — no implicit context lookup.
