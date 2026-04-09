const { getPlayerData } = require('./tacti_view/playerData');
const { generatePlayerImage } = require('./tacti_view/generatePlayerImage');
const fs = require('fs');
const path = require('path');

async function testImageGen() {
  const player = await getPlayerData('quyuyfqg');
  console.log('Player:', player);
  
  try {
    const buffer = await generatePlayerImage(player);
    if (buffer) {
      fs.writeFileSync(path.join(__dirname, 'test_player_card.png'), buffer);
      console.log('✅ Image saved: test_player_card.png');
    } else {
      console.log('❌ No buffer (canvas not available)');
    }
  } catch (err) {
    console.error('Image gen error:', err.message);
  }
}

testImageGen();

