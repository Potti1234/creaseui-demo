# Northstar Commerce

A local store operations dashboard built with Foldkit, Vite, Tailwind, and the supplied CreaseUI snapshot.

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5186 --strictPort
```

Open http://127.0.0.1:5186/. Run `npm run check` for TypeScript, ESLint, CreaseUI doctor/CSS checks, and a production build.

The Overview, Orders, and Analytics views share one Foldkit model. Reporting periods update the metrics, product breakdown, chart, and report download. Orders support search, payment filters, amount sorting, pagination, selection, CSV export, and fulfillment updates. Sample changes are local to the current browser session and reset on refresh.

Installation details and validation results are recorded in [DISCOVERY.md](DISCOVERY.md). Local diagnostics and screenshots are under `output/`.
