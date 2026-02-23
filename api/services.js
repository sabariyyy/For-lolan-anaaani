export default async function handler(req, res) {

    // ✅ CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ✅ Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const response = await fetch("https://themainsmmprovider.com/api/v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                key: "8ff2e98cd22e9906a5f7d597f814a8475bdab586",
                action: "services"
            })
        });

        // Read as text first (prevents JSON crash)
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Invalid JSON from provider:", text);
            return res.status(500).json({
                error: "Provider returned invalid JSON",
                raw: text
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ error: "Failed to fetch services" });
    }
}
