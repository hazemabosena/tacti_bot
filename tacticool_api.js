const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const port = process.env.TACTICOOL_API_PORT ? Number(process.env.TACTICOOL_API_PORT) : 3000;

// Packet directory lives inside the repo now
const packetsDir = path.join(__dirname, 'packet.bin');

let latestData = {
  playerId: 'غير معروف',
  shopOffers: [],
  regions: [],
};

function parseBinaryFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const rawText = buffer.toString('utf-8');

    // regex to pick readable strings among binary noise
    const regex = /[a-zA-Z0-9_\-\.\/]{3,100}/g;
    const matches = rawText.match(regex) || [];

    let foundOffers = [];
    let foundRegions = [];
    let foundPlayerId = latestData.playerId;

    for (const item of matches) {
      if (item.includes('com.panzerdog')) {
        foundOffers.push(item);
      } else if (item.length === 36 && (item.match(/-/g) || []).length === 4) {
        foundPlayerId = item;
      } else if (
        ['eu-central-1', 'us-east-1', 'ap-south-1', 'sa-east-1', 'af-south-1'].includes(item)
      ) {
        foundRegions.push(item);
      }
    }

    if (foundOffers.length > 0 || foundRegions.length > 0 || foundPlayerId !== 'غير معروف') {
      latestData = {
        playerId: foundPlayerId,
        shopOffers: [...new Set(foundOffers)],
        regions: [...new Set(foundRegions)],
      };

      console.log(`📡 [API] تم تحديث البيانات بنجاح من: ${path.basename(filePath)}`);
    }
  } catch (err) {
    console.error('❌ خطأ أثناء قراءة ملف الباينري:', err && err.message);
  }
}

try {
  const watcher = chokidar.watch(packetsDir, {
    persistent: true,
    ignoreInitial: false,
  });

  watcher
    .on('add', (filePath) => {
      if (filePath.endsWith('.bin')) parseBinaryFile(filePath);
    })
    .on('change', (filePath) => {
      if (filePath.endsWith('.bin')) parseBinaryFile(filePath);
    });

  console.log(`🛰️ [API] Packet watcher started on: ${packetsDir}`);
} catch (e) {
  console.error('❌ [API] Failed to start packet watcher:', e && e.message);
}

app.get('/api/tacticool', (req, res) => {
  res.json({
    status: 'success',
    data: latestData,
  });
});

// Generic lookup endpoint (kept permissive as requested)
// If you pass any string id, we only verify whether it looks like the current parsed playerId
app.get('/api/search/:id', (req, res) => {
  const id = String(req.params.id || '');
  const found = id.length > 0 && id === latestData.playerId;

  res.json({
    status: 'success',
    data: {
      query: id,
      found,
      // minimal extra info for dashboards
      playerId: latestData.playerId,
      regions: latestData.regions,
    },
  });
});

app.listen(port, () => {
  console.log(`🔥 Tacticool API شغالة دلوقتي على: http://localhost:${port}/api/tacticool`);
  console.log(`🔎 Search endpoint: http://localhost:${port}/api/search/:id`);
});

