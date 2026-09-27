"use client";

import { Chip } from "@/components/onboarding/Chip";
import { StepShell } from "@/components/onboarding/StepShell";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export function LanguageStep({
  languages,
  selected,
  onToggle,
}: {
  languages: Language[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  return (
    <StepShell title="What languages do you listen to?" hint="Pick at least one.">
      {languages.map((lang) => (
        <Chip
          key={lang.code}
          label={lang.name}
          sublabel={lang.nativeName !== lang.name ? lang.nativeName : undefined}
          selected={selected.includes(lang.code)}
          onClick={() => onToggle(lang.code)}
        />
      ))}
    </StepShell>
  );
}
