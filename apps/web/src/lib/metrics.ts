export type MetricFamilyCount = {
  name: string;
  count: number;
};

function parseSample(line: string) {
  const [nameAndLabels, value] = line.trim().split(/\s+/);

  if (!nameAndLabels || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return {
    name: nameAndLabels.split("{")[0],
    value: parsedValue,
  };
}

export function parseMetricFamilies(metricsText = ""): MetricFamilyCount[] {
  const counts = new Map<string, number>();

  metricsText
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const sample = parseSample(line);
      const family = sample?.name ?? "unknown";
      counts.set(family, (counts.get(family) ?? 0) + 1);
    });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}
