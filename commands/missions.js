const { SlashCommandBuilder } = require("discord.js");
const { missionData } = require("../missionDataActive.js");

const missionChoices = [
  { name: "Breach", value: "Breach" },
  { name: "B.S.S", value: "B.S.S" },
  { name: "Basic Mission", value: "Basic Mission" },
  { name: "Bayonet", value: "Bayonet" },
  { name: "Clean Up", value: "Clean Up" },
  { name: "Common Only", value: "Common Only" },
  { name: "Cover", value: "Cover" },
  { name: "Hammer", value: "Hammer" },
  { name: "HILDR", value: "HILDR" },
  { name: "Knife", value: "Knife" },
  { name: "Local", value: "Local" },
  { name: "Logistics", value: "Logistics" },
  { name: "Rare Only", value: "Rare Only" },
  { name: "Recon", value: "Recon" },
  { name: "Showdown", value: "Showdown" },
  { name: "Uncommon Only", value: "Uncommon Only" }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("missions")
    .setDescription("Show operators for up to 8 missions")
    .addStringOption(option => {
      option.setName("m1").setDescription("Mission 1").setRequired(true);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m2").setDescription("Mission 2").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m3").setDescription("Mission 3").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m4").setDescription("Mission 4").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m5").setDescription("Mission 5").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m6").setDescription("Mission 6").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m7").setDescription("Mission 7").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    })
    .addStringOption(option => {
      option.setName("m8").setDescription("Mission 8").setRequired(false);
      missionChoices.forEach(choice => option.addChoices(choice));
      return option;
    }),

  /**
   * Calculates the optimal operator placement for a cycle of missions
   * Returns ALL operators from missionDataActive.js sorted by optimization priority
   * Prioritizes operators with maximum stars (orange cells) for exactly one mission
   * @param {Array<string>} missions - Array of mission names in order
   * @returns {Object} - All operators sorted by optimization priority
   */
  optimizeMissionPlacement(missions) {
    // Find max value for each mission and track which operators have it
    const missionMaxes = {};
    const operatorMaxMissions = {}; // Track which missions each operator has a max in
    const allOperatorsSet = new Set();
    
    missions.forEach((mission, idx) => {
      if (!missionData[mission]) return;
      const missionOps = missionData[mission];
      const maxValue = Math.max(...Object.values(missionOps));
      missionMaxes[idx] = {
        mission,
        maxValue,
        operatorsWithMax: Object.entries(missionOps)
          .filter(([_, val]) => val === maxValue)
          .map(([op, _]) => op)
      };
      
      // Track which missions each operator has max in and collect all operators
      missionMaxes[idx].operatorsWithMax.forEach(op => {
        if (!operatorMaxMissions[op]) {
          operatorMaxMissions[op] = [];
        }
        operatorMaxMissions[op].push(idx);
      });

      // Collect all operators from this mission
      Object.keys(missionOps).forEach(op => allOperatorsSet.add(op));
    });

    const assignments = {};
    missions.forEach((mission, idx) => {
      assignments[idx] = [];
    });

    const used = new Set();
    const allOperators = Array.from(allOperatorsSet);

    // Phase 1: Assign operators who have orange (max) for ONLY ONE mission in this cycle
    missions.forEach((mission, idx) => {
      const exclusiveMaxOps = missionMaxes[idx].operatorsWithMax
        .filter(op => operatorMaxMissions[op].length === 1 && !used.has(op))
        .sort((a, b) => {
          const valA = missionData[mission][a];
          const valB = missionData[mission][b];
          return valB - valA; // Sort by value descending
        });

      exclusiveMaxOps.forEach(op => {
        assignments[idx].push(op);
        used.add(op);
      });
    });

    // Phase 2: Assign operators who have max for this mission (but max for other missions too)
    missions.forEach((mission, idx) => {
      const multiMaxOps = missionMaxes[idx].operatorsWithMax
        .filter(op => operatorMaxMissions[op].length > 1 && !used.has(op))
        .sort((a, b) => {
          const valA = missionData[mission][a];
          const valB = missionData[mission][b];
          return valB - valA; // Sort by value descending
        });

      multiMaxOps.forEach(op => {
        assignments[idx].push(op);
        used.add(op);
      });
    });

    // Phase 3: Add remaining operators sorted by value for this mission
    missions.forEach((mission, idx) => {
      const remaining = allOperators
        .filter(op => !used.has(op) && missionData[mission][op])
        .sort((a, b) => {
          const valA = missionData[mission][a];
          const valB = missionData[mission][b];
          return valB - valA; // Sort by value descending
        });

      remaining.forEach(op => {
        assignments[idx].push(op);
        used.add(op);
      });
    });

    return assignments;
  },

  async execute(interaction) {
    const missions = [];
    for (let i = 1; i <= 8; i++) {
      const m = interaction.options.getString(`m${i}`);
      if (m) missions.push(m);
    }
    if (missions.length === 0) {
      return interaction.reply("❌ You must pick at least one mission.");
    }

    // Get optimized assignments with ALL operators
    const assignments = this.optimizeMissionPlacement(missions);

    let reply = "**🎯 Optimized Mission Placement (All Operators):**\n\n";
    missions.forEach((mission, i) => {
      const selected = assignments[i] || [];
      if (selected.length > 0) {
        reply += `**M${i + 1} - ${mission}:**\n${selected.join(" , ")}\n\n`;
      } else {
        reply += `**M${i + 1} - ${mission}:** (no operators)\n\n`;
      }
    });

    await interaction.reply(reply);
  },
};