fetch('https://api.ipify.org')
  .then(res => res.text())
  .then(ip => console.log('Outbound public IP:', ip))
  .catch(err => console.error('IP lookup failed:', err));
