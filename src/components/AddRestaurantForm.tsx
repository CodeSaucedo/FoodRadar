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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Fetch live coordinates from the client browser session
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await invokeAddRestaurantEdge(latitude, longitude);
        },
        async (geoError) => {
          console.warn("Geolocation blocked or failed. Sending without bias:", geoError.message);
          // Fallback: Invoke without coordinates if user blocks permissions
          await invokeAddRestaurantEdge(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      // Fallback for older browsers
      await invokeAddRestaurantEdge(null, null);
    }
  }

  // 2. Helper to bundle payload data and cleanly trigger the Edge Function pipeline
  async function invokeAddRestaurantEdge(userLat: number | null, userLng: number | null) {
    try {
      const { data, error } = await supabase.functions.invoke(
        "add-restaurant",
        {
          body: {
            googleMapsUrl: url,
            userId,
            userLat, // ✅ Sent to your backend script's locationBias block
            userLng, // ✅ Sent to your backend script's locationBias block
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
          flex: 1,
          padding: "1.00rem",
          gap: "0.5rem"
        }}
      />
      
      <button 
        type="button"
        onClick={() => setUrl("")}
      >
        bruh  
      </button>

      <button 
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Restaurant"}
      </button>
    </form>
  );
}
