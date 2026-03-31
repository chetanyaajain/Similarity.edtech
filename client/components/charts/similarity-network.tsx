import { Card } from "@/components/ui/card";

type LinkDatum = {
  source: string;
  target: string;
  weight: number;
};

export function SimilarityNetwork({ data }: { data: LinkDatum[] }) {
  const points = [
    { name: "Aarav", x: 80, y: 80 },
    { name: "Mia", x: 260, y: 80 },
    { name: "Noah", x: 170, y: 220 }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white">Similarity Network</h3>
      <p className="mb-4 text-sm text-white/55">Visual relationship graph between students</p>
      <svg viewBox="0 0 340 280" className="w-full">
        {data.map((edge) => {
          const source = points.find((point) => point.name === edge.source);
          const target = points.find((point) => point.name === edge.target);
          if (!source || !target) return null;
          return (
            <line
              key={`${edge.source}-${edge.target}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={`rgba(251, 146, 60, ${Math.max(edge.weight / 100, 0.25)})`}
              strokeWidth={Math.max(edge.weight / 20, 2)}
            />
          );
        })}
        {points.map((point) => (
          <g key={point.name}>
            <circle cx={point.x} cy={point.y} r={26} fill="rgba(14, 165, 233, 0.18)" stroke="rgba(125, 211, 252, 0.55)" />
            <text x={point.x} y={point.y + 4} textAnchor="middle" fill="white" fontSize="12">
              {point.name}
            </text>
          </g>
        ))}
      </svg>
    </Card>
  );
}

