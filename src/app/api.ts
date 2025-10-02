import axios from "axios";

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await axios.post(
      "https://fast-simple-crm.onrender.com/api/v1/auth/refresh",
      { refresh_token: refreshToken }, // Swagger bo‘yicha
      { headers: { "Content-Type": "application/json" } }
    );

    const data = res.data;
    console.log("new access token:", data);

    if (!data.access_token) throw new Error("No access token in response");

    // yangilangan tokenlarni saqlaymiz
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);

    return data.access_token;
  } catch (err) {
    console.error("Refresh token ishlamadi:", err);
    return null;
  }
};
