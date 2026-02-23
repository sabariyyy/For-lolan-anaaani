export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { type, order_id } = req.body;

  if (!type || (type === 'status' && !order_id)) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  try {
    let bodyParams = new URLSearchParams({
      key: "0481cc5255022d113169aba5f21b44e33a8b7cb9"
    });

    if (type === 'status') {
      bodyParams.append('action', 'status');
      bodyParams.append('order', order_id);
    } else if (type === 'services') {
      bodyParams.append('action', 'services');
    } else {
      return res.status(400).json({ success: false, error: 'Invalid type. Must be "status" or "services"' });
    }

    const response = await fetch("https://themainsmmprovider.com/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Raw server response:", text);
      return res.status(500).json({ success: false, error: 'Invalid JSON response from provider', raw: text });
    }

    res.status(200).json({ success: true, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch from provider' });
  }
}
