import { Card } from "@/components/ui/card";

type Match = {
  sourceText: string;
  targetText: string;
  score: number;
};

type ComparisonPanelProps = {
  leftStudent: string;
  rightStudent: string;
  similarity: number;
  explanation: string;
  matches: Match[];
};

export function ComparisonPanel(props: ComparisonPanelProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {props.leftStudent} vs {props.rightStudent}
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-white/60">{props.explanation}</p>
        </div>
        <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-100">
          {props.similarity}% similarity
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {props.matches.map((match, index) => (
            <div key={`${match.score}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-sky-200">Source segment</div>
              {match.sourceText}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {props.matches.map((match, index) => (
            <div key={`${match.score}-mirror-${index}`} className="rounded-2xl border border-rose-400/15 bg-rose-400/10 p-4 text-sm text-white/80">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-rose-100">
                <span>Matched segment</span>
                <span>{match.score}%</span>
              </div>
              {match.targetText}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

