# Yoonie Frontend (v2: Pocket Strategist)

Next.js 16 app for Yoonie: upload hotel spreadsheets → clean → structure → insights → top 3 recommendations, streamed live, with a dashboard and grounded chat. Product context: [`PRODUCT.md`](./PRODUCT.md).

## Run

```bash
npm install
npm run dev            # http://localhost:3000
```

Sign-in still uses `yoonie-backend` (the `/api/*` rewrite in `next.config.ts`). The studio routes live in this app.

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` / `BACKEND_URL` | Backend for sign-in (unchanged) |
| `OPENROUTER_API_KEY` | Enables LLM chat. Without it, chat answers from fixed templates over the same data |
| `OPENROUTER_MODEL` | Default `anthropic/claude-sonnet-5.5` |
| `N8N_PIPELINE_WEBHOOK_URL` | Optional. Forward uploads to an n8n flow instead of the built-in pipeline |
| `PIPELINE_PACE` | Delay multiplier for the live stream (`1` default, `0` instant) |
| `STUDIO_AUTH` | `off` skips the sign-in check on studio API routes (local demos only) |

## Layout

```
app/
  page.tsx                          landing
  (protected)/studio/dashboard      Dashboard tab: upload → live pipeline → full EDA
  (protected)/studio/strategy       Strategy tab: the action plan (observation → evidence → action → target → measure)
  api/studio/pipeline/route.ts      POST files → NDJSON PipelineEvent stream
  api/studio/chat/route.ts          POST {messages, dataset} → streamed text
lib/
  types/studio/                     wire contract (PipelineEvent, Dataset, Recommendation…)
  domain/studio/engine/             parse → clean → structure → insights → recommend → run
  domain/studio/server/             auth guard, chat tools + instructions
  domain/studio/studio-api.ts       client streaming calls
providers/studio-provider.tsx       run state + latest result (localStorage)
modules/studio/                     views and components
scripts/                            sample data generator, pipeline smoke run
public/demo/                        generated sample files (hypothetical hotel)
public/brand/sam/                   Sam artwork, taken from the team's pitch deck (not regenerated)
```

## The n8n contract

Each stage maps to a future n8n workflow. Whatever runs the pipeline must stream newline-delimited JSON `PipelineEvent`s (`lib/types/studio/index.ts`): `stage` start/done, `log`, `file`, `anomaly`, `progress`, `field`, `insight`, `recommendation`, and finally `result` with the full `Dataset`. The UI doesn't care who produced them.

## Scripts

```bash
npm run demo:data       # regenerate public/demo/* (deterministic)
npm run demo:pipeline   # run the pipeline on the sample files and print findings
```
