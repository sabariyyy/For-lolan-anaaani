// /api/order-status.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "Missing order_id" });
    }

    // 🔑 Your hidden SMM API key
    const API_KEY = "8ff2e98cd22e9906a5f7d597f814a8475bdab586";

    const API_URL = "https://themainsmmprovider.com/api/v2";

    // Prepare request
    const params = new URLSearchParams();
    params.append("key", API_KEY);
    params.append("action", "status");
    params.append("order", order_id);

    // Send request to provider
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();

    // Return to frontend
    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
