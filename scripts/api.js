const { createClient } = require('@sanity/client');
const fs = require('node:fs/promises');
const path = require('node:path');

const getSiteData = async () => {
    const file = path.join(__dirname, '../json/siteSettings.json');
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    let data;

    try {
        if (projectId && dataset) {
            const client = createClient({
                projectId,
                dataset,
                token: process.env.SANITY_API_TOKEN || undefined,
                useCdn: false,
                apiVersion: '2024-09-24',
                timeout: 10000,
                maxRetries: 0,
            });
            data = await client.fetch('*[_type == "siteSettings"][0]');
        } else {
            console.warn('Sanity is not configured; using cached site settings or empty defaults.');
        }
    } catch (error) {
        console.warn('Could not fetch site settings; using cached settings or empty defaults:', error.message);
    }

    if (data == null) {
        try {
            data = JSON.parse(await fs.readFile(file, 'utf8'));
            if (data != null) return data;
        } catch {
            // A fresh checkout may not have a settings cache yet.
        }
        data = {};
    }

    try {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, JSON.stringify(data), 'utf8');
        console.log('Wrote siteSettings.json.');
    } catch (error) {
        console.warn('Could not write siteSettings.json; continuing the build:', error.message);
    }

    return data;
};

module.exports = {
    getSiteData,
};
