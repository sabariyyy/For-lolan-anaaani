export default async function handler(req, res) {
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

        const data = await response.json();

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch services" });
    }
}
