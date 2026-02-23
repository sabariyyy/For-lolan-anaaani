// server.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const { action, order_id } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, error: "Action is required" });
    }

    // SERVICES
    if (action === "services") {
      const response = await fetch("https://themainsmmprovider.com/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ key: "YOUR_API_KEY", action: "services" })
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } 
      catch { return res.status(500).json({ success: false, error: "Invalid JSON from provider", raw: text }); }

      return res.status(200).json({ success: true, data });
    }

    // ORDER STATUS
    if (action === "status") {
      if (!order_id) return res.status(400).json({ success: false, error: "Order ID is required" });

      const response = await fetch("https://themainsmmprovider.com/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ key: "YOUR_API_KEY", action: "status", order: order_id })
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } 
      catch { return res.status(500).json({ success: false, error: "Invalid JSON from provider", raw: text }); }

      return res.status(200).json({ success: true, data });
    }

    return res.status(400).json({ success: false, error: "Unknown action" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
