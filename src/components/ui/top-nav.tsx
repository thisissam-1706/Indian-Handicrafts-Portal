"use client";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { languageLabels } from "@/data/crafts";

type LanguageKey = keyof typeof languageLabels;

export default function TopNav({
  language,
  setLanguage,
}: {
  language: LanguageKey;
  setLanguage: Dispatch<SetStateAction<LanguageKey>>;
}) {
  const links = [
    ["/", "Home"],
    ["/map", "Map"],
    ["/crafts", "Crafts"],
    ["/add-craft", "Register Craft"],
    ["/chatbot", "Chatbot"],
  ];

  return (
    <header style={{ border: "1px solid #ccb8a3", borderRadius: "16px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 249, 241, 0.92)", boxShadow: "0 10px 24px rgba(91, 62, 37, 0.08)", backdropFilter: "blur(2px)" }}>
      <div>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1.22rem", background: "none", border: "none", cursor: "pointer", color: "#2f2116", padding: 0, textDecoration: "none" }}>
          Indian Handicrafts Portal
        </Link>
        {/* <div style={{ fontSize: "0.8rem" }}>Novice frontend build</div> */}
      </div>

      <nav>
        <ul style={{ display: "flex", gap: "10px", listStyle: "none", margin: 0, padding: 0 }}>
          {links.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                style={{ display: "inline-block", padding: "8px 12px", border: "1px solid #ccb8a3", borderRadius: "999px", cursor: "pointer", background: "#fffaf3", color: "#3a2a1e", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none" }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ color: "#4a3b2f", fontSize: "0.9rem", fontWeight: 600 }}>
        Language: 
        <select value={language} onChange={(e) => setLanguage(e.target.value as LanguageKey)} style={{ marginLeft: "8px", border: "1px solid #ccb8a3", background: "#fffdf9", color: "#3a2a1e", padding: "6px 10px", borderRadius: "8px" }}>
          <option value="English">EN</option>
          <option value="Hindi">HI</option>
          <option value="Telugu">TE</option>
        </select>
      </div>
    </header>
  );
}