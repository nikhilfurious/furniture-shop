import { getAuth } from "firebase/auth";

export const sendAuthRequest = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("❌ No user is signed in.");
    return;
  }

  if (user) {
    const token = await user.getIdToken(); // Get Firebase ID token
    console.log("🔹 Sending request with token:", token);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });

      console.log("📡 Response Status:", response.status);
      const data = await response.json();
      console.log("🔍 Backend Response:", data);
      return data; 
    } catch (error) {
      console.error("Error sending auth request:", error);
    }
  }
};
