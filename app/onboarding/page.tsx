import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getMyBeatsUser } from "@/lib/current-user";
import { GENRES } from "@/lib/genres";
import { hasOnboarded, listLanguages } from "@/lib/preferences";
import { MOODS } from "@/lib/taxonomy";

export default async function OnboardingPage() {
  const user = await getMyBeatsUser();
  if (!user) redirect("/login");
  if (await hasOnboarded(user.id)) redirect("/");

  const languages = await listLanguages();

  return (
    <OnboardingForm
      languages={languages}
      genres={GENRES}
      moods={MOODS}
      userName={user.name}
    />
  );
}
