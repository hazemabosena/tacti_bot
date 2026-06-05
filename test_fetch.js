const http = require('http');

const url = process.argv[2] || 'http://localhost:3000/api/tacticool';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log(data.slice(0, 1000));
  });
}).on('error', (err) => {
  console.error('FETCH ERROR:', err.message);
});

