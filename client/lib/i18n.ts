export const messages = {
  en: {
    heroTitle: "Detect assignment similarity with real AI precision.",
    heroBody:
      "A premium academic integrity platform for educators who need semantic plagiarism detection, live processing insight, and beautiful reporting."
  },
  es: {
    heroTitle: "Detecta similitud en tareas con precision de IA.",
    heroBody:
      "Una plataforma premium para docentes con deteccion semantica, seguimiento en tiempo real y reportes elegantes."
  },
  fr: {
    heroTitle: "Detectez les similarites de devoirs avec une IA fiable.",
    heroBody:
      "Une plateforme premium pour les enseignants avec detection semantique, suivi temps reel et rapports soignes."
  }
} as const;

export type Locale = keyof typeof messages;

