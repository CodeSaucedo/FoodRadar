import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
    
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  console.log("Auth data:", data);
  console.log("Auth error:", error);
}

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to confirm your account.");
    }
  }

  

  return (
    <main
      style={{
        maxWidth: 400,
        margin: "4rem auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2>FoodRadar</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        Log In
      </button>

      <button onClick={handleSignup}>
        Sign Up
      </button>
    </main>
  );
}