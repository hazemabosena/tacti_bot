const { SlashCommandBuilder } = require("discord.js");
const { missionData } = require("../missionData.js");

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
   * Prioritizes operators with maximum stars (orange cells) for exactly one mission
   * @param {Array<string>} missions - Array of mission names in order
   * @param {Object} operatorsPerMission - Number of operators needed per mission index
   * @returns {Object} - Assignment of operators to missions
   */
  optimizeMissionPlacement(missions, operatorsPerMission = {}) {
    // Default operators per mission: 1, 1, 1, 2, 2, 3, 3, 4
    const defaultOpsPerMission = [1, 1, 1, 2, 2, 3, 3, 4];
    const opsNeeded = operatorsPerMission || {};
    
    // Find max value for each mission and track which operators have it
    const missionMaxes = {};
    const operatorMaxMissions = {}; // Track which missions each operator has a max in
    
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
      
      // Track which missions each operator has max in
      missionMaxes[idx].operatorsWithMax.forEach(op => {
        if (!operatorMaxMissions[op]) {
          operatorMaxMissions[op] = [];
        }
        operatorMaxMissions[op].push(idx);
      });
    });

    const assignments = {};
    const used = new Set();

    // Phase 1: Assign operators who have orange (max) for ONLY ONE mission in this cycle
    missions.forEach((mission, idx) => {
      const slotsNeeded = opsNeeded[idx] || defaultOpsPerMission[idx] || 4;
      assignments[idx] = [];

      // Get operators with max for this mission who only have max for this mission
      const exclusiveMaxOps = missionMaxes[idx].operatorsWithMax
        .filter(op => operatorMaxMissions[op].length === 1 && !used.has(op));

      exclusiveMaxOps.slice(0, slotsNeeded).forEach(op => {
        assignments[idx].push(op);
        used.add(op);
      });
    });

    // Phase 2: Fill remaining slots with operators who have max for this mission
    missions.forEach((mission, idx) => {
      const slotsNeeded = opsNeeded[idx] || defaultOpsPerMission[idx] || 4;
      const slotsRemaining = slotsNeeded - assignments[idx].length;

      if (slotsRemaining > 0) {
        const availableMaxOps = missionMaxes[idx].operatorsWithMax
          .filter(op => !used.has(op))
          .sort((a, b) => {
            // Sort by: fewer max missions first, then by value descending
            const aMaxCount = operatorMaxMissions[a]?.length || 0;
            const bMaxCount = operatorMaxMissions[b]?.length || 0;
            if (aMaxCount !== bMaxCount) return aMaxCount - bMaxCount;
            return missionData[mission][b] - missionData[mission][a];
          });

        availableMaxOps.slice(0, slotsRemaining).forEach(op => {
          assignments[idx].push(op);
          used.add(op);
        });
      }
    });

    // Phase 3: Fill any remaining slots with top performers not yet used
    missions.forEach((mission, idx) => {
      const slotsNeeded = opsNeeded[idx] || defaultOpsPerMission[idx] || 4;
      const slotsRemaining = slotsNeeded - assignments[idx].length;

      if (slotsRemaining > 0) {
        const allOps = Object.entries(missionData[mission] || {})
          .sort((a, b) => b[1] - a[1])
          .filter(([op, _]) => !used.has(op))
          .map(([op, _]) => op);

        allOps.slice(0, slotsRemaining).forEach(op => {
          assignments[idx].push(op);
          used.add(op);
        });
      }
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

    // Get optimized assignments
    const assignments = this.optimizeMissionPlacement(missions);

    let reply = "**🎯 Optimized Mission Placement:**\n\n";
    missions.forEach((mission, i) => {
      const selected = assignments[i] || [];
      reply += `**M${i + 1} - ${mission}:** (${selected.length} ops)\n${selected.join(", ")}\n\n`;
    });

    await interaction.reply(reply);
  },
};