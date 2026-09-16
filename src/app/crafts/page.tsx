"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { crafts, languageLabels } from "@/data/crafts";
import TopNav from "@/components/ui/top-nav";
import CraftListing from "@/components/ui/craft-listing";
import Footer from "@/components/ui/footer";

function CraftsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = searchParams.get("state") || "All";

  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedTechnique, setSelectedTechnique] = useState("All");

  useEffect(() => {
    const urlState = searchParams.get("state") || "All";
    setSelectedState(urlState);
  }, [searchParams]);

  const openCraft = (id: number) => {
    router.push(`/detail?id=${id}`);
  };

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      <CraftListing
        crafts={crafts}
        query=""
        selectedState={selectedState}
        selectedCategory={selectedCategory}
        selectedMaterial={selectedMaterial}
        selectedTechnique={selectedTechnique}
        setSelectedState={setSelectedState}
        setSelectedCategory={setSelectedCategory}
        setSelectedMaterial={setSelectedMaterial}
        setSelectedTechnique={setSelectedTechnique}
        openCraft={openCraft}
      />
      <Footer />
    </div>
  );
}

export default function CraftsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-20 text-xl text-slate-500">
          Loading crafts...
        </div>
      }
    >
      <CraftsPageContent />
    </Suspense>
  );
}
