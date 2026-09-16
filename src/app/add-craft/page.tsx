"use client";

import { useState } from "react";
import { languageLabels } from "@/data/crafts";
import TopNav from "@/components/ui/top-nav";
import Footer from "@/components/ui/footer";
import AddCraftWizard from "@/components/ui/add-craft-wizard";
import SectionHeading from "@/components/ui/section-heading";

export default function AddCraftPage() {
  const [language, setLanguage] = useState<keyof typeof languageLabels>("English");

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <TopNav language={language} setLanguage={setLanguage} />
      
      <main style={{ padding: "60px 24px", background: "linear-gradient(to bottom, #fffaf3, #f7eed9)" }}>
        <SectionHeading 
          title="Contribute to Heritage" 
          subtitle="Share a traditional handicraft from your region with the world. Your contribution helps preserve India's rich artistic legacy."
        />
        <AddCraftWizard />
      </main>

      <Footer />
    </div>
  );
}
