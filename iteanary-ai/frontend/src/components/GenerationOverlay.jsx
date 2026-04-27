import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const generationStages = [
  "Reading your destination vibe and travel constraints",
  "Mapping neighborhoods and must-see landmarks",
  "Balancing food, culture, movement, and downtime",
  "Optimizing day-by-day routing for smoother travel",
  "Finalizing your itinerary with AI refinements"
];

export function GenerationOverlay({ open }) {
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setActiveStage(0);
      return undefined;
    }

    const startedAt = Date.now();
    const duration = 8000;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      const nextStage = Math.min(
        Math.floor((elapsed / duration) * generationStages.length),
        generationStages.length - 1
      );

      setProgress(nextProgress);
      setActiveStage(nextStage);
    }, 120);

    return () => window.clearInterval(interval);
  }, [open]);

  const stageItems = useMemo(
    () =>
      generationStages.map((stage, index) => ({
        label: stage,
        active: index <= activeStage
      })),
    [activeStage]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="glass w-[92%] max-w-lg rounded-[32px] p-8 text-center"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/6">
              <div className="relative h-16 w-16">
                <span className="absolute inset-0 rounded-full border border-sky-300/30 animate-ping" />
                <span className="absolute inset-2 rounded-full border border-fuchsia-300/30 animate-pulse" />
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/50">AI is crafting your journey ✨</p>
            <h3 className="mt-4 text-3xl font-semibold text-white">Synthesizing the perfect route</h3>
            <p className="mt-4 text-sm leading-6 text-white/62">{generationStages[activeStage]}</p>
            <div className="mx-auto mt-6 flex w-fit gap-3">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-3 w-3 rounded-full bg-gradient-to-r from-sky-300 to-fuchsia-300"
                  animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: dot * 0.2 }}
                />
              ))}
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full bg-[linear-gradient(90deg,#38bdf8,#818cf8,#f472b6)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              />
            </div>
            <div className="mt-6 space-y-3 text-left">
              {stageItems.map((stage) => (
                <div
                  key={stage.label}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    stage.active
                      ? "border-sky-300/25 bg-white/8 text-white"
                      : "border-white/6 bg-white/[0.03] text-white/38"
                  }`}
                >
                  {stage.label}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
