export default function (req, res, next) {
  const allowedOrigins = ['https://imasdk.googleapis.com', 'https://localhost:3000', '*'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // MIMEタイプを設定
  if (req.url.endsWith('.m3u8')) {
    res.setHeader('Content-Type', 'application/x-mpegURL');
  } else if (req.url.endsWith('.ts')) {
    res.setHeader('Content-Type', 'video/mp2t');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  next();
}
