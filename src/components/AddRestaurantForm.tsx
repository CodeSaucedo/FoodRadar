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

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
            const { data, error } =
        await supabase.functions.invoke(
          "add-restaurant",
          {
            body: {
              googleMapsUrl: url,
              userId,
            },
          }
        );

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        throw error;
      }

      console.log(
        "Function response:",
        data
      );

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
        gap: "0.5rem",
        marginBottom: "2rem",
      }}
    >
      <input
        type="url"
        placeholder="Paste Google Maps link..."
        value={url}
        onChange={(e) =>
          setUrl(e.target.value)
        }
        required
        style={{
          flex: 1,
          padding: "0.75rem",
        }}
      />

      <button disabled={loading}>
        {loading
          ? "Saving..."
          : "Save Restaurant"}
      </button>
    </form>
  );
}