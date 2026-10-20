import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import type { Restaurant } from "../types/database";

import AddRestaurantForm from "../components/AddRestaurantForm";
type DashboardProps = {
  session: Session;
};

export default function Dashboard({ session }: DashboardProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRestaurants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRestaurants(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

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

  return (
    <main style={{ padding: "2rem" }}>
      <h2>FoodRadar Dashboard</h2>

      <p>
        Logged in as: <strong>{session.user.email}</strong>
      </p>

      <button onClick={() => supabase.auth.signOut()}>
        Log Out
      </button>

      <AddRestaurantForm
    userId={session.user.id}
     onAdded={loadRestaurants}
    />

      <hr />

      <h3>Your Restaurants</h3>

      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants saved yet.</p>
      ) : (
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant.id}>

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

              <strong>{restaurant.name}</strong>
              <br />

              <a
                href={restaurant.google_maps_url}
                target="_blank"
                rel="noreferrer"
              >
                Open Maps
              </a>

              <br />

              <button
                onClick={() =>
                  deleteRestaurant(restaurant.id)
                }
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