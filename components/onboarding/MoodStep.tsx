"use client";

import { Chip } from "@/components/onboarding/Chip";
import { StepShell } from "@/components/onboarding/StepShell";

export function MoodStep({
  moods,
  selected,
  onToggle,
}: {
  moods: readonly string[];
  selected: string[];
  onToggle: (mood: string) => void;
}) {
  return (
    <StepShell title="What moods do you listen to?" hint="Optional.">
      {moods.map((mood) => (
        <Chip
          key={mood}
          label={mood}
          selected={selected.includes(mood)}
          onClick={() => onToggle(mood)}
        />
      ))}
    </StepShell>
  );
}
