import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const API_KEY = "0481cc5255022d113169aba5f21b44e33a8b7cb9";
const API_URL = "https://themainsmmprovider.com/api/v2";

// Single endpoint to handle both services and order status
app.post('/server', async (req, res) => {
  const { action, order_id } = req.body;

  if (!action) {
    return res.status(400).json({ success: false, error: 'Action is required: "services" or "status"' });
  }

  try {
    const bodyParams = new URLSearchParams({ key: API_KEY, action });

    if (action === "status") {
      if (!order_id) {
        return res.status(400).json({ success: false, error: 'Order ID is required for status' });
      }
      bodyParams.append("order", order_id);
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Raw provider response:", text);
      return res.status(502).json({
        success: false,
        error: "Invalid JSON from provider",
        raw: text
      });
    }

    res.status(200).json({ success: true, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch from provider" });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
