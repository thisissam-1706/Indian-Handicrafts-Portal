"use client";

import { useMemo } from "react";
import { Craft } from "@/lib/types";
import SectionHeading from "@/components/ui/section-heading";
import CraftCard from "@/components/ui/craft-card";
import FilterBar from "@/components/ui/filter-bar";
import { getNormalizedTag } from "@/data/crafts";

export default function CraftListing({
  crafts,
  query,
  selectedState,
  selectedCategory,
  selectedMaterial,
  selectedTechnique,
  setSelectedState,
  setSelectedCategory,
  setSelectedMaterial,
  setSelectedTechnique,
  openCraft,
}: {
  crafts: Craft[];
  query: string;
  selectedState: string;
  selectedCategory: string;
  selectedMaterial: string;
  selectedTechnique: string;
  setSelectedState: (v: string) => void;
  setSelectedCategory: (v: string) => void;
  setSelectedMaterial: (v: string) => void;
  setSelectedTechnique: (v: string) => void;
  openCraft: (id: number) => void;
}) {
  const filtered = useMemo(() => {
    return crafts.filter((craft) => {
      const stateMatch = selectedState === "All" || craft.state === selectedState;
      const categoryMatch = selectedCategory === "All" || getNormalizedTag('category', craft.category) === selectedCategory;
      const materialMatch = selectedMaterial === "All" || getNormalizedTag('material', craft.material) === selectedMaterial;
      const techniqueMatch = selectedTechnique === "All" || getNormalizedTag('technique', craft.technique) === selectedTechnique;
      return stateMatch && categoryMatch && materialMatch && techniqueMatch;
    });
  }, [crafts, selectedState, selectedCategory, selectedMaterial, selectedTechnique]);

  return (
    <section style={{ margin: "24px 0" }}>
      <SectionHeading
        title="Find Crafts"
        subtitle="Search and filter for handicrafts using the options below."
      />
      
      <FilterBar
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedMaterial={selectedMaterial}
        setSelectedMaterial={setSelectedMaterial}
        selectedTechnique={selectedTechnique}
        setSelectedTechnique={setSelectedTechnique}
      />
      
      <div style={{ 
        border: "1px solid #ccb8a3", 
        padding: "24px", 
        borderRadius: "20px", 
        background: "rgba(255, 250, 244, 0.4)",
        boxShadow: "inset 0 2px 10px rgba(82, 56, 36, 0.03)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#2e2016", fontSize: "1.2rem", fontWeight: 800 }}>
            {filtered.length} Treasures Found
          </h3>
          <p style={{ margin: 0, color: "#8c7b6c", fontSize: "0.85rem" }}>
            Scroll to explore more
          </p>
        </div>

        <div style={{ 
          height: "360px", /* Height of exactly one row of cards */
          overflowY: "auto", 
          paddingBottom: "10px",
          paddingRight: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "#9e4f2f #f4e6d3"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "20px" 
          }}>
            {filtered.map((craft) => (
              <div key={craft.id}>
                <CraftCard
                  craft={craft}
                  categoryTag={getNormalizedTag("category", craft.category)}
                  techniqueTag={getNormalizedTag("technique", craft.technique)}
                  onOpen={() => openCraft(craft.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}