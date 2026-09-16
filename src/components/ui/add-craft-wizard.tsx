"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crafts, filters, states } from "@/data/crafts";
import { Craft } from "@/lib/types";
import { findBestDuplicate } from "@/lib/static-search";
import SearchableDropdown from "./searchable-dropdown";

const CATEGORIES = filters.category.filter(c => c !== "All");
const MATERIALS = filters.material.filter(m => m !== "All");
const TECHNIQUES = filters.technique.filter(t => t !== "All");
const LOCAL_CRAFTS_KEY = "ihp-custom-crafts-v1";

function loadLocalCrafts(): Craft[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_CRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Craft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalCrafts(allCrafts: Craft[]) {
  window.localStorage.setItem(LOCAL_CRAFTS_KEY, JSON.stringify(allCrafts));
}

export default function AddCraftWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [similarityResult, setSimilarityResult] = useState<{ similarity: number, match: { name: string, state: string } | null } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    image: "",
    category: "",
    material: "",
    technique: "",
    gi: false,
    summary: "",
    history: "",
    artisan: "Community Craft",
    language: ["English", "Hindi"]
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Reset similarity if critical identity fields change
    if (field === "name" || field === "summary") setSimilarityResult(null);
  };

  const performDuplicateCheck = async () => {
    setIsScanning(true);
    try {
      const existing = [...crafts, ...loadLocalCrafts()];
      const data = findBestDuplicate(
        {
          name: formData.name,
          state: formData.state,
          summary: formData.summary,
          category: formData.category,
          material: formData.material,
          technique: formData.technique,
        },
        existing
      );
      setSimilarityResult(data);
    } catch (error) {
      console.error("Duplicate check failed");
    } finally {
      setIsScanning(false);
    }
  };

  const nextStep = async () => {
    if (step === 3) {
      await performDuplicateCheck();
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (similarityResult && similarityResult.similarity > 0.85) return;
    
    setIsSubmitting(true);
    try {
      const localCrafts = loadLocalCrafts();
      const nextId = Math.max(...crafts.map((c) => c.id), ...localCrafts.map((c) => c.id), 0) + 1;

      const newCraft: Craft = {
        id: nextId,
        name: formData.name,
        state: formData.state,
        district: "",
        category: formData.category || "Craft",
        material: formData.material || "Traditional",
        technique: formData.technique || "Traditional",
        gi: formData.gi,
        artisan: formData.artisan,
        language: formData.language,
        summary: formData.summary,
        history: formData.history || formData.summary,
        authenticity: "Submitted by community contributor",
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1578301978162-7aae4d755744?q=80&w=1200&auto=format&fit=crop",
      };

      saveLocalCrafts([...localCrafts, newCraft]);
      alert("Craft saved locally for this browser session profile.");
      router.push("/crafts");
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSimilarityAlert = () => {
    if (!similarityResult) return null;

    const { similarity, match } = similarityResult;
    const percentage = Math.round(similarity * 100);

    if (similarity > 0.85) {
      return (
        <div style={{ padding: "16px", background: "#fee2e2", border: "1px solid #ef4444", borderRadius: "12px", marginBottom: "20px", color: "#b91c1c" }}>
          <h4 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            🚨 Registration Strictly Blocked
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            This craft metadata is <strong>{percentage}% identical</strong> to an existing entry: 
            <strong> {match?.name}</strong> ({match?.state}).
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: "0.85rem", opacity: 0.8 }}>
            Duplicates are not allowed to maintain registry integrity. Please verify if this craft already exists.
          </p>
        </div>
      );
    }

    if (similarity > 0.65) {
      return (
        <div style={{ padding: "16px", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "12px", marginBottom: "20px", color: "#92400e" }}>
          <h4 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ Possible Duplicate Detected
          </h4>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Similarity detected: <strong>{percentage}%</strong> match found with <strong>{match?.name}</strong>.
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: "0.85rem", opacity: 0.8 }}>
            Please ensure you are registering a unique craft or a distinct regional variant.
          </p>
        </div>
      );
    }

    return (
      <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #4ade80", borderRadius: "12px", marginBottom: "20px", color: "#166534", fontSize: "0.9rem" }}>
        ✅ <strong>Heritage Integrity Verified:</strong> No major duplicates found (Similarity: {percentage}%).
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Step 1: Identity</h2>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Craft Name *</label>
              <input
                type="text"
                placeholder="e.g. Blue Pottery of Jaipur"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                style={inputStyle}
              />
            </div>
            <SearchableDropdown
              label="State / UT *"
              options={states.filter(s => s !== "All")}
              value={formData.state}
              onChange={(val) => updateField("state", val)}
              placeholder="Select or type state name"
            />
            <div style={formGroupStyle}>
              <label style={labelStyle}>Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => updateField("image", e.target.value)}
                style={inputStyle}
              />
              <p style={{ fontSize: "0.75rem", color: "#a39081", marginTop: "4px" }}>
                Provide a valid URL for the craft's primary image.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Step 2: Attributes</h2>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Material</label>
              <select
                value={formData.material}
                onChange={(e) => updateField("material", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Material</option>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Technique</label>
              <select
                value={formData.technique}
                onChange={(e) => updateField("technique", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Technique</option>
                {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ ...formGroupStyle, flexDirection: "row", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="gi-status"
                checked={formData.gi}
                onChange={(e) => updateField("gi", e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="gi-status" style={{ ...labelStyle, marginBottom: 0 }}>Has Geographic Indication (GI) Tag</label>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Step 3: Narrative</h2>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Summary *</label>
              <textarea
                placeholder="A short introduction to the craft..."
                value={formData.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>History</label>
              <textarea
                placeholder="Historical significance and origins..."
                value={formData.history}
                onChange={(e) => updateField("history", e.target.value)}
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Step 4: Review</h2>
            {renderSimilarityAlert()}
            <div style={{ background: "#fdf1ea", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0" }}><strong>Name:</strong> {formData.name || "N/A"}</p>
              <p style={{ margin: "0 0 10px 0" }}><strong>Region:</strong> {formData.state}</p>
              <p style={{ margin: "0 0 10px 0" }}><strong>Classification:</strong> {formData.category} ({formData.material}, {formData.technique})</p>
              <p style={{ margin: "0 0 10px 0" }}><strong>GI Status:</strong> {formData.gi ? "Yes" : "No"}</p>
              <p style={{ margin: "0" }}><strong>Summary Length:</strong> {formData.summary.length} characters</p>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#6b5a4b", textAlign: "center" }}>
              By submitting, you agree that this information is accurate to the best of your knowledge.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.name && formData.state;
    if (step === 3) return formData.summary.length > 20;
    return true;
  };

  return (
    <div style={containerStyle}>
      {/* Progress Bar */}
      <div style={progressContainerStyle}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              ...progressStepStyle,
              background: step >= s ? "#9e4f2f" : "#e5d5c5",
              color: step >= s ? "#fff" : "#705c4d",
            }}
          >
            {s}
          </div>
        ))}
        <div style={{ ...progressLineStyle, width: `${(step - 1) * 33}%` }} />
      </div>

      {renderStep()}

      <div style={buttonContainerStyle}>
        {step > 1 && (
          <button onClick={prevStep} style={secondaryButtonStyle}>Back</button>
        )}
        <div style={{ flex: 1 }} />
        {step < 4 ? (
          <button 
            onClick={nextStep} 
            disabled={!isStepValid()}
            style={{ ...primaryButtonStyle, opacity: isStepValid() ? 1 : 0.5 }}
          >
            Next
          </button>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={() => router.push("/crafts")}
              style={{ ...secondaryButtonStyle, color: "#d32f2f", borderColor: "#d32f2f" }}
            >
              Delete
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              style={primaryButtonStyle}
            >
              {isSubmitting ? "Registering..." : "Register Craft"}
            </button>
          </div>
        )}
      </div>

      {/* Exit Button */}
      <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid #f0ece6", paddingTop: "16px" }}>
        <button 
          onClick={() => router.push("/")}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#8c7b6c", 
            fontSize: "0.85rem", 
            textDecoration: "underline", 
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Exit Process
        </button>
      </div>

      {/* Scanning Overlay */}
      {isScanning && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 250, 244, 0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          borderRadius: "20px",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid #f3e8dd",
            borderTop: "4px solid #9e4f2f",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }} />
          <h3 style={{ color: "#9e4f2f", margin: 0 }}>Scanning Heritage Integrity...</h3>
          <p style={{ color: "#8c7b6c", fontSize: "0.9rem", marginTop: "10px" }}>Checking registry for similar crafts</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "40px auto",
  padding: "40px",
  background: "#fffaf4",
  border: "1px solid #cfb9a2",
  borderRadius: "20px",
  boxShadow: "0 15px 40px rgba(89, 60, 38, 0.08)",
};

const progressContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  position: "relative",
  marginBottom: "40px",
  padding: "0 10px",
};

const progressStepStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  zIndex: 2,
  transition: "all 0.3s ease",
  border: "4px solid #fffaf4",
};

const progressLineStyle: React.CSSProperties = {
  position: "absolute",
  top: "18px",
  left: "20px",
  height: "4px",
  background: "#9e4f2f",
  transition: "width 0.3s ease",
  opacity: 0.3,
  zIndex: 1,
};

const stepContentStyle: React.CSSProperties = {
  minHeight: "350px",
};

const stepTitleStyle: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 800,
  color: "#2d2015",
  marginBottom: "24px",
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: "24px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#4c3727",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "1px solid #cfb9a2",
  borderRadius: "10px",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  marginTop: "40px",
  gap: "16px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 32px",
  background: "#9e4f2f",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "12px 32px",
  background: "transparent",
  color: "#9e4f2f",
  border: "1px solid #9e4f2f",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
};
