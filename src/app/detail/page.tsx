"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { crafts, languageLabels } from "@/data/crafts";
import TopNav from "@/components/ui/top-nav";
import CraftDetail from "@/components/ui/craft-detail";
import Footer from "@/components/ui/footer";

function DetailPageContent() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");

  const craftId = Number(searchParams.get("id") || 1);
  const craft = useMemo(
    () => crafts.find((item) => item.id === craftId) || crafts[0],
    [craftId]
  );

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      <CraftDetail craft={craft} />
      <Footer />
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-20 text-xl text-slate-500">
          Loading craft details...
        </div>
      }
    >
      <DetailPageContent />
    </Suspense>
  );
}
