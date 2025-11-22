function getFilter(query) {
    const filter = {};
    for (const [key, value] of Object.entries(query)) {
        // Ignore parameters with null value or 'null' string
        if (value !== null && value !== 'null' && value !== '') {
            filter[key] = value;
        }
    }
    return filter;
}

async function sendWebhook(data) {
    const res = await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await res.json();
}

module.exports = { getFilter, sendWebhook };