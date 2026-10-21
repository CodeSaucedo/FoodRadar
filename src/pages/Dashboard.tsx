import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import type { Restaurant } from "../types/database";

import AddRestaurantForm from "../components/AddRestaurantForm";
import AddRestaurantModal from "../components/AddRestaurantModal";

type DashboardProps = {
  session: Session;
};

export default function Dashboard({ session }: DashboardProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadRestaurants() {
    setLoading(true);

    // Check if the browser supports geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // 1. Fetch restaurants with calculated real-time distances
          const { data, error } = await supabase.rpc(
            "get_restaurants_with_distance",
            {
              user_lat: latitude,
              user_lng: longitude,
            }
          );

          if (error) {
            console.error("RPC Error:", error);
            // Fallback if the RPC database call fails
            await fetchFallbackRestaurants();
          } else {
            setRestaurants(data ?? []);
          }
          setLoading(false);
        },
        async (geoError) => {
          console.warn("Geolocation denied or failed:", geoError.message);
          // 2. Fallback if user blocks location permissions
          await fetchFallbackRestaurants();
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      // 3. Fallback for older browsers without geolocation support
      await fetchFallbackRestaurants();
      setLoading(false);
    }
  }

  // Helper fallback query matching your original implementation
  async function fetchFallbackRestaurants() {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fallback Error:", error);
    } else {
      setRestaurants(data ?? []);
    }
  }

  async function deleteRestaurant(id: number) {
    const { error } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
    } else {
      loadRestaurants();
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Distance converter utility
  const formatDistance = (meters: number | undefined) => {
    if (meters === undefined || meters === null) return null;
    
    // Convert meters to miles
    const miles = meters * 0.000621371; 
    
    if (miles < 0.1) return "📍 Less than 0.1 mi away";
    return `📍 ${miles.toFixed(1)} mi away`;
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h2>FoodRadar Dashboard</h2>

      <p>
        Logged in as: <strong>{session.user.email}</strong>
      </p>

      <br />

      <button onClick={() => supabase.auth.signOut()}>
        Log Out
      </button>
      <br />
      <br />

      <button 
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: "1rem", padding: "1.0rem 1rem", cursor: "pointer" }}
      >
        ➕ Add New Restaurant
      </button>

      <AddRestaurantModal
        userId={session.user.id}
        onAdded={loadRestaurants}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <AddRestaurantForm
          userId={session.user.id}
          onAdded={loadRestaurants}
        />
        <br />

        <button 
          onClick={() => setIsModalOpen(false)}
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          ➕ Cancel
        </button>
      </AddRestaurantModal>

      <hr />

      <h3>Your Restaurants</h3>

      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants saved yet.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {restaurants.map((restaurant) => (
            <li key={restaurant.id} style={{ marginBottom: "2rem", maxWidth: "400px" }}>
              <img
                src={
                  restaurant.image_url ||
                  "https://via.placeholder.com/600x400?text=No+Image"
                }
                alt={restaurant.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <br />
              <strong style={{ fontSize: "1.2rem" }}>{restaurant.name}</strong>
              
              {/* ✅ Renders live distance badge when location calculation succeeds */}
              {restaurant.distance_meters !== undefined && (
                <div style={{ color: "#666", fontSize: "0.9rem", margin: "0.2rem 0" }}>
                  {formatDistance(restaurant.distance_meters)}
                </div>
              )}
              
              <br />
              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noreferrer"
                style={{ marginRight: "1rem" }}
              >
                Open Maps
              </a>

              <button
                onClick={() => deleteRestaurant(restaurant.id)}
                style={{ cursor: "pointer" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
