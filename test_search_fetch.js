const http = require('http');

const base = process.argv[2] || 'http://localhost:3000';
const id = process.argv[3] || 'T9DA4T27';
const url = `${base}/api/search/${id}`;

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log(data.slice(0, 2000));
  });
}).on('error', (err) => {
  console.error('FETCH ERROR:', err.message);
});

