export default function handler(req, res) {
  const country = req.headers['x-vercel-ip-country'] || '';
  res.setHeader('Cache-Control', 's-maxage=86400, public');
  res.json({ country });
}
