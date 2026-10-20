import { useState } from "react";
import { supabase } from "../lib/supabase";

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Refreshes the list after a successful insert
}

export default function AddRestaurantModal({ isOpen, onClose, onSuccess }: AddRestaurantModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // If the visibility state is false, do not render any HTML elements
  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("restaurants")
      .insert([{ name }]);

    setLoading(false);
    if (!error) {
      setName("");
      onSuccess(); // Trigger parent data re-fetch
      onClose();   // Close the window
    } else {
      alert(error.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add New Restaurant</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              placeholder="e.g., Pizza Planet"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}