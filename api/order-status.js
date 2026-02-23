export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    try {
        const response = await fetch("https://themainsmmprovider.com/api/v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                key: "8ff2e98cd22e9906a5f7d597f814a8475bdab586",
                action: "status",
                order: order_id
            })
        });

        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Raw server response:", text);
            return res.status(500).json({ success: false, error: 'Invalid JSON response from provider', raw: text });
        }

        // Return structured data
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch order status' });
    }
}
