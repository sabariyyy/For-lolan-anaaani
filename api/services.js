export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'Missing order_id in request body' });
    }

    // Call the SMM provider API
    const response = await fetch("https://themainsmmprovider.com/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        key: "0481cc5255022d113169aba5f21b44e33a8b7cb9", // your API key
        action: "status", // order status action
        order: order_id   // order id from request
      })
    });

    // Check if external API response is ok
    if (!response.ok) {
      const text = await response.text(); // sometimes it returns plain text
      console.error('External API error:', text);
      return res.status(502).json({ error: 'Failed to fetch order status from provider' });
    }

    // Parse JSON safely
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error('Invalid JSON from provider:', text);
      return res.status(502).json({ error: 'Invalid JSON returned from provider' });
    }

    // Return in standard structure
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
