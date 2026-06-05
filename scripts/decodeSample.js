const fs = require('fs');
const path = require('path');
const { parsePlayerData } = require('./parser');

async function run() {
  const binDir = path.join(__dirname, '..', 'packet.bin');
  if (!fs.existsSync(binDir)) {
    console.error('packet.bin directory not found');
    process.exit(1);
  }

  const sample = fs
    .readdirSync(binDir)
    .filter((f) => f.endsWith('.bin'))
    .sort()
    .slice(0, 3);

  if (!sample.length) {
    console.error('No .bin files found in packet.bin');
    process.exit(1);
  }

  for (const f of sample) {
    const full = path.join(binDir, f);
    const buf = fs.readFileSync(full);

    console.log(`\n--- Decoding sample: ${f} (size=${buf.length}) ---`);
    const decoded = await parsePlayerData(buf);

    if (!decoded) {
      console.log('Decoded result: null (likely not a protobuf payload or wrong schema)');
      continue;
    }

    console.log('Decoded fields (partial):', {
      playerId: decoded.playerId,
      name: decoded.name,
      rating: decoded.rating,
      level: decoded.level,
      matchesCount: decoded.matchesCount,
      winsCount: decoded.winsCount,
      totalKills: decoded.totalKills,
    });
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

