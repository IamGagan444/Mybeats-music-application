"use client";

import { Chip } from "@/components/onboarding/Chip";
import { StepShell } from "@/components/onboarding/StepShell";

export function GenreStep({
  genres,
  selected,
  onToggle,
}: {
  genres: readonly string[];
  selected: string[];
  onToggle: (genre: string) => void;
}) {
  return (
    <StepShell title="What genres do you like?" hint="Optional.">
      {genres.map((genre) => (
        <Chip
          key={genre}
          label={genre}
          selected={selected.includes(genre)}
          onClick={() => onToggle(genre)}
        />
      ))}
    </StepShell>
  );
}
