/**
 * Mock player data for /view command.
 * Replace with Players Club API or DB fetch later.
 */

const mockPlayers = {
  gabigol: {
    name: 'Gabigol',
    level: 52,
    rating: 2850,
    kills: 18166,
    kdr: 3.18,
    clan: 'No Mercy',
    stats: [
      'Wins: 1245',
      'Losses: 567',
      'Winrate: 68.7%',
      'Headshots: 42%',
    ],
  },
  test1: {
    name: 'Test Player',
    level: 45,
    rating: 2600,
    kills: 12500,
    kdr: 2.85,
    clan: 'Test Clan',
    stats: [
      'Wins: 890',
      'Losses: 430',
      'Winrate: 67.4%',
      'Headshots: 38%',
    ],
  },
  tacti: {
    name: 'TactiBot',
    level: 60,
    rating: 3200,
    kills: 25000,
    kdr: 4.2,
    clan: 'Tacti Elite',
    stats: [
      'Wins: 1800',
      'Losses: 200',
      'Winrate: 90%',
      'Headshots: 55%',
    ],
  },
  pro: {
    name: 'ProGamer',
    level: 58,
    rating: 3100,
    kills: 22000,
    kdr: 3.95,
    clan: 'Pro Squad',
    stats: [
      'Wins: 1650',
      'Losses: 300',
      'Winrate: 84.6%',
      'Headshots: 52%',
    ],
  },
  noob: {
    name: 'NoobSlayer',
    level: 30,
    rating: 1800,
    kills: 4500,
    kdr: 1.5,
    clan: 'Beginners',
    stats: [
      'Wins: 320',
      'Losses: 450',
      'Winrate: 41.6%',
      'Headshots: 22%',
    ],
  },
  mazen: {
    name: 'Mazen',
    level: 65,
    rating: 2950,
    kills: 19876,
    kdr: 3.45,
    clan: 'TACTIOP',
    stats: [
      'Wins: 1420',
      'Losses: 410',
      'Winrate: 77.6%',
      'Headshots: 48%',
    ],
  },
  eagle: {
    name: 'Eagle Eye',
    level: 48,
    rating: 2720,
    kills: 15600,
    kdr: 3.02,
    clan: 'Visionaries',
    stats: [
      'Wins: 1080',
      'Losses: 520',
      'Winrate: 67.5%',
      'Headshots: 45%',
    ],
  },
  legend: {
    name: 'Legend',
    level: 70,
    rating: 3400,
    kills: 30000,
    kdr: 4.8,
    clan: 'Legends',
    stats: [
      'Wins: 2200',
      'Losses: 150',
      'Winrate: 93.6%',
      'Headshots: 60%',
    ],
  },
  quyuyfqg: {
    name: 'QUYUYFQG',
    level: 50,
    rating: 2700,
    kills: 15000,
    kdr: 2.8,
    clan: 'Test',
    stats: [
      'Wins: 900',
      'Losses: 400',
      'Winrate: 69%',
      'Headshots: 40%',
    ],
  },
};

async function getPlayerData(id) {
  const key = String(id || '').toLowerCase().trim();
  return mockPlayers[key] || null;
}

module.exports = { getPlayerData, mockPlayers };
