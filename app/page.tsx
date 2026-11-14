import Link from "next/link";
import { ArrowRight, Calculator, Lightbulb, ListChecks, Search, Sparkles, Target, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  { icon: Search, title: "Cleaning", line: "Finds duplicates, missing amounts and numbers that don't add up, and asks you instead of guessing." },
  { icon: ListChecks, title: "Structuring", line: "Pulls out what matters: occupancy, ADR, RevPAR, costs, margin, review themes." },
  { icon: Lightbulb, title: "Insights", line: "Shows what changed and how sure we are. A correlation is labelled as one." },
  { icon: Target, title: "Recommendations", line: "Your top 3 actions, each with the numbers behind it and a way to check it worked." },
];

export default function LandingPage() {
  return (
    <div className="w-full">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="size-3.5" /> Your pocket strategist
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-primary sm:text-5xl">
            Your hotel already has the data. Yoonie tells you what to do next.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Drop in the spreadsheets you already keep: bookings, expenses, guest reviews. Yoonie cleans them, makes sense of them, and recommends
            practical actions, with the evidence and a way to measure each one.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/studio">
                Try it with a sample hotel <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mascot/yoonie-happy.png" alt="Yoonie, the mascot" className="mx-auto w-56 sm:w-72" />
      </section>

      <section className="border-y border-border bg-linen/50">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-14 sm:px-6">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            A dashboard tells you what happened. Yoonie helps you decide what to do about it.
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-surface p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary">
                  <s.icon className="size-4" />
                </span>
                <p className="mt-3 text-xs font-semibold text-gold">Step {i + 1}</p>
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Every recommendation shows its working</h2>
            <p className="text-muted-foreground">
              Cause → action → effect → numbers ← evidence. The arithmetic comes from your own data, never from a guess. You decide whether to act,
              and Yoonie helps you check whether it worked.
            </p>
          </div>
          <article className="rounded-2xl border border-primary/30 bg-surface p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Example · hypothetical hotel</p>
            <h3 className="mt-1 text-lg font-bold">Fill July weekdays with a 7-night promotion</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="flex gap-2.5">
                <Search className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Cause:</strong> July occupancy was 56%, against a 70% July baseline: a 20% relative drop (56 ÷ 70 − 1), mostly on weekdays.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Wrench className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Action:</strong> test a 7-night promotion on low-demand weekday nights.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Target className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Effect:</strong> target +10% bookings on those nights vs a comparable baseline. A target to test, not a promise.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Calculator className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong>Measure:</strong> bookings, average daily rate, net room revenue and contribution margin, before vs after.
                </span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>Yoonie by Yulio Labs</span>
          <span>yoonie.app</span>
        </div>
      </footer>
    </div>
  );
}
