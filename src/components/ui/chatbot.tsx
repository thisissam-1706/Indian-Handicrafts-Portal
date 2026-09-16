"use client";

import { Fragment, ReactNode, useEffect, useState } from "react";
import { chatbotSeed, crafts, languageLabels } from "@/data/crafts";
import { searchCrafts } from "@/lib/static-search";
import SectionHeading from "@/components/ui/section-heading";

type ChatSource = {
  id: number;
  name: string;
  state: string;
  category: string;
  gi: boolean;
};

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  sources?: ChatSource[];
};

type StoredChatState = {
  messages: ChatMessage[];
  updatedAt: number;
};

const CHAT_STORAGE_KEY = "ihp-chatbot-recent-v1";

function isValidRole(role: unknown): role is ChatMessage["role"] {
  return role === "assistant" || role === "user";
}

function sanitizeStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const role = (item as { role?: unknown }).role;
      const text = (item as { text?: unknown }).text;
      return isValidRole(role) && typeof text === "string";
    })
    .map((item) => {
      const safeItem = item as {
        role: ChatMessage["role"];
        text: string;
        sources?: ChatSource[];
      };
      return {
        role: safeItem.role,
        text: safeItem.text,
        sources: Array.isArray(safeItem.sources) ? safeItem.sources : undefined,
      };
    });
}

function renderLineWithLinks(line: string): ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = linkRegex.exec(line)) !== null) {
    const [fullMatch, label, href] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      nodes.push(line.slice(lastIndex, matchIndex));
    }

    nodes.push(
      <a
        key={`${label}-${href}-${matchIndex}`}
        href={href}
        style={{ color: "#7d3e24", textDecoration: "underline", fontWeight: 600 }}
      >
        {label}
      </a>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  if (nodes.length === 0) {
    return line;
  }

  return nodes.map((node, index) => <Fragment key={`n-${index}`}>{node}</Fragment>);
}

function renderMessageText(text: string): ReactNode {
  const lines = text.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
      {lines.map((line, index) => (
        <div key={`line-${index}`} style={{ whiteSpace: "pre-wrap" }}>
          {renderLineWithLinks(line)}
        </div>
      ))}
    </div>
  );
}

function buildLocalReply(message: string, selectedState: string): { text: string; sources: ChatSource[] } {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  if (/\b(hi|hello|hey|namaste)\b/.test(lower)) {
    return {
      text: "Hello! Ask me about a state, category, material, or technique and I will suggest matching crafts from this static catalog.",
      sources: [],
    };
  }

  if (/\b(thanks|thank you)\b/.test(lower)) {
    return {
      text: "Happy to help. You can ask things like: GI crafts in Kerala, wood crafts in Karnataka, or Banaras crafts.",
      sources: [],
    };
  }

  let baseResults = searchCrafts(trimmed, crafts, 12);
  if (selectedState !== "All") {
    baseResults = baseResults.filter((craft) => craft.state === selectedState);
  }

  if (/\bgi\b|geographical indication/.test(lower)) {
    const giOnly = baseResults.filter((craft) => craft.gi);
    if (giOnly.length > 0) {
      const text = [
        `I found ${giOnly.length} GI-focused match${giOnly.length > 1 ? "es" : ""}:`,
        ...giOnly.slice(0, 5).map((craft, index) => `${index + 1}. ${craft.name} (${craft.state}) - [Open craft page](/detail?id=${craft.id})`),
      ].join("\n");
      return {
        text,
        sources: giOnly.slice(0, 5).map((craft) => ({
          id: craft.id,
          name: craft.name,
          state: craft.state,
          category: craft.category,
          gi: craft.gi,
        })),
      };
    }
  }

  if (baseResults.length === 0) {
    return {
      text: "I could not find a close match. Try mentioning a state, craft name, material, or technique (for example: Rajasthan block printing, Kerala coir, metal casting).",
      sources: [],
    };
  }

  const shortlist = baseResults.slice(0, 5);
  const text = [
    `I found ${shortlist.length} relevant craft suggestion${shortlist.length > 1 ? "s" : ""}:`,
    ...shortlist.map(
      (craft, index) =>
        `${index + 1}. ${craft.name} (${craft.state}) | ${craft.category} | ${craft.material} | ${craft.technique} - [Open craft page](/detail?id=${craft.id})`
    ),
  ].join("\n");

  return {
    text,
    sources: shortlist.map((craft) => ({
      id: craft.id,
      name: craft.name,
      state: craft.state,
      category: craft.category,
      gi: craft.gi,
    })),
  };
}

export default function Chatbot({
  language,
  selectedState,
}: {
  language: keyof typeof languageLabels;
  selectedState: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatbotSeed);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<StoredChatState>;
      const restoredMessages = sanitizeStoredMessages(parsed.messages);

      if (restoredMessages.length > 0) {
        setMessages(restoredMessages.slice(-24));
      }
    } catch (error) {
      console.warn("Failed to restore chatbot history", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      const payload: StoredChatState = {
        messages: messages.slice(-24),
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to persist chatbot history", error);
    }
  }, [isHydrated, messages]);

  const clearChat = () => {
    if (isLoading || isClearing) return;

    setIsClearing(true);
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear local chat history", error);
    } finally {
      setMessages(chatbotSeed);
      setInput("");
      setIsClearing(false);
    }
  };

  const send = async () => {
    if (!input.trim() || isLoading || isClearing) return;
    const userText = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    setIsLoading(true);
    try {
      const data = buildLocalReply(userText, selectedState);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Chat response failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I could not process that right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={{ padding: "20px" }}>
      <SectionHeading
        title="Chat with our Assistant"
        subtitle="Ask questions about handicrafts and get basic guidance."
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1 1 250px", border: "1px solid #ceb8a2", padding: "15px", height: "fit-content", borderRadius: "14px", background: "#fffaf3", boxShadow: "0 10px 24px rgba(86, 58, 36, 0.07)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, borderBottom: "1px solid #dbc8b5", marginBottom: "10px", marginTop: 0, color: "#2f2116" }}>
            Chatbot Help
          </h3>
          <ul style={{ paddingLeft: "20px", fontSize: "0.9rem", lineHeight: "1.7", color: "#4e3d30" }}>
            <li>Runs fully in your browser (no backend required)</li>
            <li>Searches the current static craft catalog</li>
            <li>Supports GI and state-oriented prompts</li>
            <li>Stores recent chat locally in this browser</li>
          </ul>
        </div>

        <div style={{ flex: "2 1 400px", border: "1px solid #ceb8a2", display: "flex", flexDirection: "column", borderRadius: "14px", overflow: "hidden", background: "#fffaf4", boxShadow: "0 12px 28px rgba(89, 61, 39, 0.08)" }}>
          <div style={{ borderBottom: "1px solid #dbc8b5", padding: "12px", background: "linear-gradient(135deg, #f4e3cf 0%, #edd5be 100%)" }}>
            <div style={{ fontWeight: 700, color: "#3d2a1c" }}>Assistant Shell</div>
            <div style={{ fontSize: "0.8rem", color: "#654c3a" }}>
              Ask about crafts, GI, materials, techniques, and state-wise recommendations.
            </div>
            <div style={{ marginTop: "8px" }}>
              <button
                onClick={clearChat}
                disabled={isLoading || isClearing}
                style={{
                  fontSize: "0.75rem",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "1px solid #a45a38",
                  background: "#fff3e8",
                  color: "#5f351f",
                  cursor: isLoading || isClearing ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {isClearing ? "Clearing..." : "Clear Chat"}
              </button>
            </div>
          </div>

          <div style={{ height: "400px", overflowY: "scroll", padding: "15px", background: "#fffdf9" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "9px 12px",
                  border: msg.role === "user" ? "1px solid #935034" : "1px solid #d6c3b1",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "#9e4f2f" : "#fff9f3",
                  color: msg.role === "user" ? "#fffaf5" : "#2e2117",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 12px rgba(79, 54, 35, 0.06)"
                }}>
                  <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>
                  {renderMessageText(msg.text)}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: "8px", borderTop: "1px solid #e6d6c9", paddingTop: "6px" }}>
                      <div style={{ fontSize: "0.78rem", opacity: 0.85, marginBottom: "4px" }}>Sources:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {msg.sources.map((source) => (
                          <a
                            key={source.id}
                            href={`/detail?id=${source.id}`}
                            style={{
                              fontSize: "0.74rem",
                              border: "1px solid #d6c3b1",
                              borderRadius: "999px",
                              padding: "3px 8px",
                              color: "#5a402d",
                              textDecoration: "none",
                              background: "#fff8ef",
                            }}
                          >
                            {source.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    maxWidth: "80%",
                    padding: "9px 12px",
                    border: "1px solid #d6c3b1",
                    borderRadius: "12px",
                    background: "#fff9f3",
                    color: "#2e2117",
                    fontSize: "0.9rem",
                    boxShadow: "0 4px 12px rgba(79, 54, 35, 0.06)",
                  }}
                >
                  <strong>Bot:</strong> Thinking...
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #dbc8b5", padding: "10px", display: "flex", gap: "10px", background: "#fff6eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question here..."
              disabled={isLoading || isClearing}
              style={{ flex: 1, padding: "10px", border: "1px solid #c9b09a", borderRadius: "10px", background: "#fffdf9", color: "#3d2a1d" }}
            />
            <button
              onClick={send}
              disabled={isLoading || isClearing}
              style={{ padding: "10px 15px", border: "1px solid #935034", borderRadius: "10px", cursor: "pointer", background: "#9e4f2f", color: "#fff9f2", fontWeight: 700 }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
