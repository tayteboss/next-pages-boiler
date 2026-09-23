const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const api = require('./api');

const buildSiteData = async () => {
	await api.getSiteData();
};

buildSiteData();
