const path = require('path');

let CanvasLib = null;
let createCanvas = null;
let fontFamily = 'sans-serif';

try {
  CanvasLib = require('canvas');
} catch (_) {
  try {
    CanvasLib = require('@napi-rs/canvas');
  } catch (_) {
    CanvasLib = null;
  }
}

if (CanvasLib) {
  createCanvas = CanvasLib.createCanvas;
  const fontPath = path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf');
  if (CanvasLib.registerFont) {
    try {
      CanvasLib.registerFont(fontPath, { family: 'Roboto' });
      fontFamily = 'Roboto';
    } catch (_) {}
  }
}

function fontOrFallback(px, weight) {
  const prefix = weight ? `${weight} ` : '';
  return `${prefix}${px}px "${fontFamily}"`;
}

function drawTextSafe(ctx, text, x, y, opts = {}) {
  const defaults = {
    px: 24,
    weight: 'bold',
    color: '#FFFFFF',
    align: 'left',
    baseline: 'middle',
  };
  const config = { ...defaults, ...opts };
  ctx.save();
  ctx.fillStyle = config.color;
  ctx.font = fontOrFallback(config.px, config.weight);
  ctx.textAlign = config.align;
  ctx.textBaseline = config.baseline;
  ctx.fillText(String(text || ''), x, y);
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = r || 8;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

async function generatePlayerImage(player) {
  if (!createCanvas) return null;
  if (!player) throw new Error('No player data');

  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  drawTextSafe(ctx, player.name, 50, 55, {
    px: 42,
    weight: 'bold',
    color: '#FFFFFF',
    baseline: 'alphabetic',
  });

  const panelX = 480;
  const panelY = 80;
  const panelW = 300;
  const panelH = 240;
  const panelPad = 20;

  ctx.fillStyle = '#0B2A44';
  drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.fill();

  ctx.strokeStyle = '#3FA9F5';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 12);
  ctx.stroke();

  drawTextSafe(ctx, 'STATS', panelX + panelW / 2, panelY + 45, {
    px: 28,
    weight: 'bold',
    color: '#FF4444',
    align: 'center',
  });

  const coreY = panelY + 75;
  drawTextSafe(ctx, `Level: ${player.level || '?'}`, panelX + panelPad, coreY, { px: 20 });
  drawTextSafe(ctx, `Rating: ${player.rating || '?'}`, panelX + panelPad, coreY + 25, { px: 20 });
  drawTextSafe(ctx, `Kills: ${player.kills || 0}`, panelX + panelPad, coreY + 50, { px: 20 });
  drawTextSafe(ctx, `KDR: ${Number(player.kdr || 0).toFixed(2)}`, panelX + panelPad, coreY + 75, {
    px: 20,
  });

  const stats = Array.isArray(player.stats) ? player.stats : [];
  const statsY = panelY + 165;
  for (let i = 0; i < Math.min(stats.length, 4); i += 1) {
    drawTextSafe(ctx, stats[i], panelX + panelPad, statsY + i * 25, {
      px: 18,
      color: i % 2 === 0 ? '#FFFFFF' : '#FF6666',
      weight: 'bold',
    });
  }

  drawTextSafe(ctx, `Clan: ${player.clan || 'Solo'}`, width / 2, height - 35, {
    px: 26,
    weight: 'bold',
    color: '#FFFFFF',
    align: 'center',
  });

  ctx.strokeStyle = '#3FA9F5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, height - 20);
  ctx.lineTo(width - 50, height - 20);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

module.exports = { generatePlayerImage };
