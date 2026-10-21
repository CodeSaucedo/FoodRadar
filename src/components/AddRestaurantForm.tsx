import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  userId: string;
  onAdded: () => void;
};

export default function AddRestaurantForm({
  userId,
  onAdded,
}: Props) {
  const [url, setUrl] = useState("");
  const [descText, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Define character limit metrics
  const MAX_LIMIT = 200;
  const isTooLong = descText.length > MAX_LIMIT;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Prevent submission if the field is in an error state
    if (isTooLong) return;

    setLoading(true);

    // Fetch live coordinates from the client browser session
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await invokeAddRestaurantEdge(latitude, longitude);
        },
        async (geoError) => {
          console.warn("Geolocation blocked or failed. Sending without bias:", geoError.message);
          await invokeAddRestaurantEdge(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      await invokeAddRestaurantEdge(null, null);
    }
  }

  async function invokeAddRestaurantEdge(userLat: number | null, userLng: number | null) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "add-restaurant",
        {
          body: {
            googleMapsUrl: url,
            userId,
            userLat, 
            userLng,
            description: descText
          },
        }
      );

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        throw error;
      }

      console.log("Function response:", data);
      setUrl("");
      setText(""); // Clear description on successful add
      onAdded();

    } catch (err: any) {
      console.error("FULL ERROR:", err);

      if (err.context) {
        const errorBody = await err.context.json();
        console.error("EDGE FUNCTION ERROR:", errorBody);
      }

      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginBottom: "0.5rem",
      }}
    >
      <input
        type="url"
        placeholder="Paste Google Maps link..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        style={{
          padding: "1.00rem",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <input
          type="text"
          placeholder="Describe the spot! (200 characters or less)"
          value={descText}
          onChange={(e) => setText(e.target.value)}
          required
          // Remove native maxLength so users can continue typing/pasting
          aria-invalid={isTooLong}
          style={{
            padding: "1.00rem",
            border: isTooLong ? "2px solid #dc3545" : "1px solid #ccc",
            outline: "none"
          }}
        />
        
        {/* Footer info containing counter metrics and warnings */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontSize: "0.85rem",
          padding: "0 0.25rem" 
        }}>
          <span style={{ color: isTooLong ? "#dc3545" : "#666" }}>
            {descText.length} / {MAX_LIMIT} characters
          </span>
          
          {isTooLong && (
            <span role="alert" style={{ color: "#dc3545", fontWeight: "bold" }}>
              ⚠️ Too long by {descText.length - MAX_LIMIT} characters!
            </span>
          )}
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading || isTooLong} // Disable button if loading OR input length is invalid
        style={{
          padding: "0.75rem",
          cursor: (loading || isTooLong) ? "not-allowed" : "pointer",
          backgroundColor: isTooLong ? "#e0e0e0" : "",
          color: isTooLong ? "#a1a1a1" : ""
        }}
      >
        {loading ? "Saving..." : "Save Restaurant"}
      </button>
    </form>
  );
}
