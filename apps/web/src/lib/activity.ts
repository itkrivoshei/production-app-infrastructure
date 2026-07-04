import { useCallback, useEffect, useState } from "react";
import type {
  ActivityEntry,
  ActivityEntryStatus,
} from "@/components/dashboard/ActivityConsole";

let activitySequence = 0;
const maxActivityEntries = 10;

type AddActivityInput = {
  title: string;
  description: string;
  status?: ActivityEntryStatus;
};

function isActivityEntry(value: unknown): value is ActivityEntry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const entry = value as Partial<ActivityEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.timestamp === "string" &&
    (entry.status === "info" ||
      entry.status === "success" ||
      entry.status === "warning" ||
      entry.status === "error")
  );
}

function readStoredEntries(storageKey?: string) {
  if (!storageKey || typeof window === "undefined") {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return undefined;

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return undefined;

    return parsed.filter(isActivityEntry).slice(0, maxActivityEntries);
  } catch {
    return undefined;
  }
}

export function useActivityLog(
  initialEntries: ActivityEntry[] = [],
  storageKey?: string,
) {
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>(
    () => readStoredEntries(storageKey) ?? initialEntries,
  );

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(activityEntries));
    } catch {
      // Browser storage can be unavailable in private or restricted contexts.
    }
  }, [activityEntries, storageKey]);

  const addActivity = useCallback((entry: AddActivityInput) => {
    activitySequence += 1;

    setActivityEntries((current) => [
      {
        id: `${Date.now()}-${activitySequence}`,
        timestamp: new Date().toISOString(),
        status: entry.status ?? "info",
        title: entry.title,
        description: entry.description,
      },
      ...current,
    ].slice(0, maxActivityEntries));
  }, []);

  return {
    activityEntries,
    addActivity,
  };
}
