export type ParsedStudentIdentity = {
  prn: string;
  name: string;
};

export function parseStudentIdentity(filename: string): ParsedStudentIdentity {
  const stem = filename.replace(/\.[^.]+$/, "").trim();
  if (!stem) {
    return { prn: "", name: "Unknown Student" };
  }

  const separatorIndex = stem.indexOf("_");
  const prn = separatorIndex >= 0 ? stem.slice(0, separatorIndex).trim() : "";
  const rawName = separatorIndex >= 0 ? stem.slice(separatorIndex + 1) : stem;
  const normalizedName = rawName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    prn,
    name: normalizedName || "Unknown Student",
  };
}
