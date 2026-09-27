"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GenreStep } from "@/components/onboarding/GenreStep";
import { LanguageStep, type Language } from "@/components/onboarding/LanguageStep";
import { MoodStep } from "@/components/onboarding/MoodStep";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  languages: Language[];
  genres: readonly string[];
  moods: readonly string[];
  userName: string;
}

const STEPS = ["languages", "genres", "moods"] as const;

export function OnboardingForm({ languages, genres, moods, userName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggler =
    (list: string[], setList: (next: string[]) => void) => (value: string) =>
      setList(
        list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
      );

  const submit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languages: selectedLanguages,
          genres: selectedGenres,
          moods: selectedMoods,
        }),
      });
      if (!res.ok) throw new Error();
      router.replace("/");
      router.refresh();
    } catch {
      setError("Couldn't save your preferences. Please try again.");
      setIsSaving(false);
    }
  };

  const isLast = step === STEPS.length - 1;
  const selectedCount = [selectedLanguages, selectedGenres, selectedMoods][step]
    .length;
  const canAdvance = step === 0 ? selectedLanguages.length > 0 : true;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to MyBeats, {userName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tell us what you listen to. You can change this any time.
          </p>
        </div>
        <div className="flex items-center gap-2" aria-hidden>
          {STEPS.map((name, i) => (
            <span
              key={name}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-brand" : "bg-surface-raised"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </header>

      {step === 0 ? (
        <LanguageStep
          languages={languages}
          selected={selectedLanguages}
          onToggle={toggler(selectedLanguages, setSelectedLanguages)}
        />
      ) : step === 1 ? (
        <GenreStep
          genres={genres}
          selected={selectedGenres}
          onToggle={toggler(selectedGenres, setSelectedGenres)}
        />
      ) : (
        <MoodStep
          moods={moods}
          selected={selectedMoods}
          onToggle={toggler(selectedMoods, setSelectedMoods)}
        />
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="sticky bottom-0 -mx-4 mt-auto flex items-center gap-3 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={isSaving}
            className="h-12 gap-2 rounded-full px-5 text-sm font-semibold"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={isLast ? submit : () => setStep(step + 1)}
          disabled={!canAdvance || isSaving}
          className="h-12 gap-2 rounded-full bg-brand px-8 text-sm font-bold tracking-wide text-brand-foreground uppercase transition-transform hover:scale-105 hover:bg-brand"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {isLast ? "Start listening" : "Next"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {selectedCount} selected
        </span>
      </div>
    </div>
  );
}
