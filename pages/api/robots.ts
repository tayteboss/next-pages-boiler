import type { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET');
		return res.status(405).end('Method Not Allowed');
	}

	const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
	const siteUrl = (
		process.env.SITE_URL || 'http://localhost:3000'
	).replace(/\/+$/, '');

	const body = isProduction
		? [
				'User-agent: *',
				'Allow: /',
				'',
				`Host: ${siteUrl}`,
				`Sitemap: ${siteUrl}/sitemap.xml`,
				'',
			].join('\n')
		: ['User-agent: *', 'Disallow: /', ''].join('\n');

	res.setHeader('Content-Type', 'text/plain; charset=utf-8');
	res.setHeader('Cache-Control', 'public, max-age=3600');
	res.status(200).send(body);
};

export default handler;
