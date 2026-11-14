/** Runs the pipeline on the sample files with no pacing and prints what it found. `npm run demo:pipeline` */
import { readFileSync, readdirSync } from "node:fs";
import { runPipeline } from "@/lib/domain/studio/engine/run";

const dir = "public/demo";
const files = readdirSync(dir).map((name) => {
  const b = readFileSync(`${dir}/${name}`);
  return { name, data: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer };
});
for await (const e of runPipeline(files, { pace: 0, propertyName: "Sam's Garden House (sample)" })) {
  if (e.type === "anomaly") console.log(`  [${e.anomaly.severity}] ${e.anomaly.title} — ${e.anomaly.detail} (${e.anomaly.sheet ?? ""} r${e.anomaly.row ?? "-"}) → ${e.anomaly.resolution}`);
  else if (e.type === "stage" && e.status === "done") console.log(`== ${e.stage}: ${e.summary}`);
  else if (e.type === "insight") console.log(`\nINSIGHT ${e.insight.title}\n  ${e.insight.detail}\n${e.insight.evidence.map((x) => `   - ${x.label}: ${x.value}`).join("\n")}`);
  else if (e.type === "recommendation") console.log(`\nREC #${e.recommendation.rank} ${e.recommendation.title}\n  ${e.recommendation.action.summary}\n  target: ${e.recommendation.effect.target}\n${e.recommendation.numbers.map((n) => `   = ${n.label}: ${n.value}   [${n.basis}]`).join("\n")}`);
  else if (e.type === "result") console.log(`\nKPIs`, e.dataset.kpis.map((k) => `${k.key} ${k.current?.toFixed(3)} vs ${k.previous?.toFixed(3)}`).join(" | "), "\nJul-26", JSON.stringify(e.dataset.months.find((m) => m.month === "2026-07"), null, 0).slice(0, 400));
  else if (e.type === "error") console.log("ERROR", e.message);
}
