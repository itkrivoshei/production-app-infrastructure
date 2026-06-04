import { useCallback, useState } from "react";
import type {
  ActivityEntry,
  ActivityEntryStatus,
} from "@/components/dashboard/ActivityConsole";

let activitySequence = 0;

type AddActivityInput = {
  title: string;
  description: string;
  status?: ActivityEntryStatus;
};

export function useActivityLog(initialEntries: ActivityEntry[] = []) {
  const [activityEntries, setActivityEntries] =
    useState<ActivityEntry[]>(initialEntries);

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
    ].slice(0, 10));
  }, []);

  return {
    activityEntries,
    addActivity,
  };
}
