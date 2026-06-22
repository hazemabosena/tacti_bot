const { SlashCommandBuilder } = require("discord.js");
const { AttachmentBuilder } = require("discord.js");
const generateMissionImage = require("../image/generateMissionImage.js");
const { missionData } = require("../missionDataActive.js");
const {
  languages,
  normalizeLanguage,
  translateMission,
  translateOperator,
  translateUi
} = require("../translations.js");

const missionChoices = [
  { name: "Skip", value: "Skip" },
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

const placementModes = [
  { name: "Default Mode", value: "default" },
  { name: "Smart Balance Mode", value: "smart_balance" }
];

function addMissionOption(command, optionName, description) {
  return command.addStringOption(option =>
    option
      .setName(optionName)
      .setDescription(description)
      .setRequired(false)
      .setAutocomplete(true)
  );
}

function getLocalizedMissionChoices(language, focusedValue = "") {
  const query = String(focusedValue || "").trim().toLowerCase();
  const localizedChoices = missionChoices.map(choice => ({
    name: translateMission(choice.value, language),
    value: choice.value,
    englishName: choice.name
  }));

  const filtered = query
    ? localizedChoices.filter(choice =>
        choice.name.toLowerCase().includes(query) ||
        choice.englishName.toLowerCase().includes(query)
      )
    : localizedChoices;

  return filtered.slice(0, 25).map(({ name, value, englishName }) => ({
    name: name === englishName ? name : `${name} (${englishName})`,
    value
  }));
}

function createClanMissionCommand() {
  let command = new SlashCommandBuilder()
    .setName("clanmission")
    .setDescription("Pick missions and get best operators placement for your clan")
    .addStringOption(option => {
      option.setName("language").setDescription("Output language").setRequired(true);
      languages.forEach(choice => option.addChoices(choice));
      return option;
    });

  for (let i = 1; i <= 8; i++) {
    command = addMissionOption(command, `m${i}`, `Mission ${i}`);
  }

  // Mode option added AFTER missions and is NOT required
  command.addStringOption(option => {
    option.setName("mode").setDescription("Placement mode (optional, default: Default Mode)").setRequired(false);
    placementModes.forEach(choice => option.addChoices(choice));
    return option;
  });

  return command;
}

// Assign operators with special rules:
// - If an operator has the SAME value across all selected (non-skip) missions, place them ONLY in the LAST selected mission
// - Otherwise, place them in the mission where they have the highest value
function assignBestOperators(missions) {
  // New rules:
  // 1) If an operator has the SAME star value across multiple selected missions,
  //    distribute it across those missions instead of always putting it into one.
  //    - Even split: distribute evenly.
  //    - Odd split (when total count > 1 operator copies): give the extra copy to the higher-priority mission (higher mission slot index).
  //    Note: this function returns operator lists per mission (not per slot), but we still distribute by slot priority.
  // 2) Mission processing priority is highest mission slot first.

  const selected = missions
    .map((m, idx) => ({ mission: m, slotIndex: idx }))
    .filter(x => x.mission && x.mission.toLowerCase() !== 'skip');

  // Priority: Mission 8 first, then 7... Mission 1 last
  selected.sort((a, b) => b.slotIndex - a.slotIndex);

  // Build a per-operator map of slotIndex->value
  const perOp = {};
  for (const { mission, slotIndex } of selected) {
    const ops = missionData[mission] || {};
    for (const [op, value] of Object.entries(ops)) {
      if (!perOp[op]) perOp[op] = {};
      perOp[op][slotIndex] = value;
    }
  }

  // Prepare result buckets (key by mission name)
  const results = {};
  for (const { mission } of selected) results[mission] = [];

  for (const [op, valuesBySlot] of Object.entries(perOp)) {
    const entries = Object.entries(valuesBySlot).map(([slotIndexStr, value]) => ({
      slotIndex: Number(slotIndexStr),
      value
    }));
    if (entries.length === 0) continue;

    // Find max value for this operator in this cycle
    const maxValue = Math.max(...entries.map(e => e.value));

    // Consider all missions (slots) where operator achieves maxValue
    const bestSlots = entries
      .filter(e => e.value === maxValue)
      .sort((a, b) => b.slotIndex - a.slotIndex); // higher priority first

    if (bestSlots.length === 1) {
      const target = bestSlots[0];
      const missionName = selected.find(s => s.slotIndex === target.slotIndex).mission;
      results[missionName].push({ op, value: maxValue });
      continue;
    }

    // Distribute the operator across all bestSlots.
    // Since each operator appears once in the output, distribute based on split priority:
    // - If it appears in N missions with same maxValue, place it into the highest-priority mission.
    //   This preserves deterministic output and still avoids always choosing "last mission".
    // - If in the future you support multiple copies, you can extend counts.
    const target = bestSlots[0];
    const missionName = selected.find(s => s.slotIndex === target.slotIndex).mission;
    results[missionName].push({ op, value: maxValue });
  }

  // Sort operators within each mission by value desc, then name asc
  for (const mission of Object.keys(results)) {
    results[mission].sort((a, b) => (b.value - a.value) || a.op.localeCompare(b.op));
  }

  return results;
}

function getSelectedSlots(missions) {
  return missions
    .map((mission, slotIndex) => ({ mission, slotIndex }))
    .filter(item => item.mission && item.mission.toLowerCase() !== "skip");
}

function getAllOperatorNames() {
  const operators = new Set();
  for (const ops of Object.values(missionData)) {
    for (const op of Object.keys(ops || {})) operators.add(op);
  }
  return Array.from(operators).sort((a, b) => a.localeCompare(b));
}

function calculateSmartQuotas(selectedSlots, operatorCount) {
  const totalWeight = selectedSlots.reduce((sum, _slot, index) => sum + index + 1, 0);
  const quotas = selectedSlots.map((_slot, index) => {
    const weight = index + 1;
    const exact = (weight / totalWeight) * operatorCount;
    return {
      count: Math.round(exact),
      remainder: exact - Math.floor(exact)
    };
  });

  let used = quotas.reduce((sum, quota) => sum + quota.count, 0);
  const addOrder = quotas
    .map((quota, index) => ({ index, remainder: quota.remainder }))
    .sort((a, b) => (b.remainder - a.remainder) || (b.index - a.index));

  for (let i = 0; used < operatorCount; i++, used++) {
    quotas[addOrder[i % addOrder.length].index].count++;
  }

  for (let i = quotas.length - 1; used > operatorCount && i >= 0;) {
    if (quotas[i].count > 0) {
      quotas[i].count--;
      used--;
    }
    i = i === 0 ? quotas.length - 1 : i - 1;
  }

  return quotas.map(quota => quota.count);
}

function assignSmartBalanceOperators(missions) {
  const selectedSlots = getSelectedSlots(missions);
  const results = missions.map(() => []);
  if (selectedSlots.length === 0) return results;

  const operators = getAllOperatorNames();
  const quotas = calculateSmartQuotas(selectedSlots, operators.length);
  const remaining = quotas.slice();

  const operatorProfiles = operators.map(op => {
    const scores = selectedSlots.map((slot, selectedIndex) => ({
      selectedIndex,
      slotIndex: slot.slotIndex,
      mission: slot.mission,
      value: (missionData[slot.mission] && missionData[slot.mission][op]) || 0
    }));
    const bestValue = scores.reduce((max, score) => Math.max(max, score.value), 0);
    return { op, bestValue, scores };
  });

  operatorProfiles.sort((a, b) => (b.bestValue - a.bestValue) || a.op.localeCompare(b.op));

  for (const profile of operatorProfiles) {
    const rankedScores = profile.scores
      .slice()
      .sort((a, b) =>
        (b.value - a.value) ||
        (b.selectedIndex - a.selectedIndex) ||
        a.mission.localeCompare(b.mission)
      );

    let target = rankedScores.find(score => remaining[score.selectedIndex] > 0);
    if (!target) {
      target = rankedScores[rankedScores.length - 1];
    }

    if (target) {
      results[target.slotIndex].push({ op: profile.op, value: target.value });
      remaining[target.selectedIndex] = Math.max(0, remaining[target.selectedIndex] - 1);
    }
  }

  for (const ops of results) {
    ops.sort((a, b) => (b.value - a.value) || a.op.localeCompare(b.op));
  }

  return results;
}

module.exports = {
  data: createClanMissionCommand(),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    if (!/^m[1-8]$/.test(focused.name)) {
      return interaction.respond([]);
    }

    const language = normalizeLanguage(interaction.options.getString("language"));
    return interaction.respond(getLocalizedMissionChoices(language, focused.value));
  },

  async execute(interaction) {
    // DEFER FIRST, before any processing — this gives us 15 minutes instead of 3 seconds
    let useDeferReply = true;
    try {
      await interaction.deferReply();
      console.log("✅ Deferred successfully");
    } catch (deferErr) {
      console.log("⚠️  Defer failed; using followUp instead. Error:", deferErr && deferErr.code);
      useDeferReply = false;
    }

    // NOW get language, missions, and process
    const language = normalizeLanguage(interaction.options.getString("language"));
    const placementMode = interaction.options.getString("mode") || "default";
    const missions = [];
    for (let i = 1; i <= 8; i++) {
      const m = interaction.options.getString(`m${i}`);
      missions.push(m ? m : "Skip");
    }

    // Ensure at least one non-skip mission
    const nonSkip = missions.filter(m => m && m.toLowerCase() !== "skip");
    if (nonSkip.length === 0) {
      try {
        const message = translateUi("mustPickMission", language);
        if (useDeferReply) {
          return await interaction.editReply(message);
        }
        return await interaction.followUp(message);
      } catch (err) {
        console.error('Could not send error message:', err && err.message);
      }
      return;
    }

    // Assign operators using the selected placement mode.
    const smartResults = placementMode === "smart_balance"
      ? assignSmartBalanceOperators(missions)
      : null;
    const results = smartResults || assignBestOperators(missions);

    // Build textual reply, preserving skipped slots in output order
    let reply = `**${translateUi("title", language)}**\n\n`;
    missions.forEach((m, i) => {
      const missionLabel = m && m.toLowerCase() !== 'skip'
        ? translateMission(m, language)
        : `(${translateUi("skipped", language)})`;
      const header = `M${i + 1} - ${missionLabel}`;
      if (!m || m.toLowerCase() === 'skip') {
        // Skipped mission: just show header
        reply += `${header}\n\n`;
        return;
      }

      const opsList = smartResults
        ? (smartResults[i] || [])
        : (results[m] && results[m].length ? results[m] : []);
      if (opsList.length === 0) {
        reply += `${header}\n- ${translateUi("noOperators", language)}\n\n`;
        return;
      }

      // Compact inline list, no numbers
      const names = opsList.map(o => translateOperator(o.op, language)).join(' , ');
      reply += `${header}\n- ${names}\n\n`;
    });

    try {
      // Build mission objects for the image — ALWAYS 8 slots (skipped slots kept)
      // Use SAME operators as shown in message (from results)
      const missionObjects = missions.map((m, index) => {
        if (!m || m.toLowerCase() === "skip") {
          return {
            name: translateMission("Skip", language),
            originalName: "Skip",
            skippedLabel: translateUi("skipped", language).toUpperCase(),
            operators: []
          };
        }
        const missionOps = smartResults ? (smartResults[index] || []) : (results[m] || []);
        return {
          name: translateMission(m, language),
          originalName: m,
          noOperatorsLabel: translateUi("noOperators", language),
          operators: missionOps.map(o => ({
            name: o.op,
            originalName: o.op,
            displayName: translateOperator(o.op, language),
            value: o.value
          }))
        };
      });

      // Debug logs to help verify correct input to image generator
      console.log("MISSIONS FOR IMAGE:", missionObjects.map(m => m.name));

      // Generate image buffer
      console.log("Starting image generation...");
      const buffer = await generateMissionImage(missionObjects);
      console.log("Image generated. Buffer:", buffer ? `${buffer.length} bytes` : "null/undefined");

      // Validate buffer
      if (!buffer || buffer.length === 0) {
        console.error("generateMissionImage returned an invalid buffer");
        throw new Error("Invalid image buffer");
      }

      console.log("Creating attachment...");
      const attachment = new AttachmentBuilder(buffer, { name: "clan_mission.png" });
      console.log("Attachment created. Sending reply with image...");

      // Use editReply if deferred, otherwise use followUp
      if (useDeferReply) {
        await interaction.editReply({ content: reply, files: [attachment] });
        console.log("✅ Reply sent successfully with editReply!");
      } else {
        await interaction.followUp({ content: reply, files: [attachment] });
        console.log("✅ Reply sent successfully with followUp!");
      }
      
    } catch (err) {
      console.error("❌ Error in image generation/sending:", err.message || err);
      // Fallback: send textual reply only
      try {
        console.log("Sending fallback text-only reply...");
        if (useDeferReply) {
          await interaction.editReply({ content: reply });
        } else {
          await interaction.followUp({ content: reply });
        }
        console.log("Fallback reply sent");
      } catch (fallbackErr) {
        console.error("Could not send fallback reply:", fallbackErr && fallbackErr.message);
      }
    }
  },
  _internal: {
    assignBestOperators,
    assignSmartBalanceOperators,
    calculateSmartQuotas
  }
};
