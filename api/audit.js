export default function handler(req, res) {
    if (req.method === 'POST') {
        const { bytes } = req.body;

        if (typeof bytes !== 'number' || bytes < 0) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const KWH_PER_GB = 0.06;
        const CARBON_INTENSITY = 475; // g CO2/kWh

        const gb = bytes / (1024 ** 3);
        const kwh = gb * KWH_PER_GB;
        const carbonG = kwh * CARBON_INTENSITY;
        const carbonMg = carbonG * 1000;

        res.status(200).json({
            success: true,
            carbonMg: Number(carbonMg.toFixed(2)),
            timestamp: Date.now()
        });
    }
}
