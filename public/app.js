const elements = {
  loading: document.querySelector("#loading-state"),
  login: document.querySelector("#login-state"),
  loginError: document.querySelector("#login-error"),
  dashboard: document.querySelector("#dashboard"),
  empty: document.querySelector("#empty-state"),
  guildSelect: document.querySelector("#guild-select"),
  serverHelp: document.querySelector("#server-help"),
  userName: document.querySelector("#user-name"),
  logout: document.querySelector("#logout-button"),
  settingsPanel: document.querySelector("#settings-panel"),
  selectedGuildName: document.querySelector("#selected-guild-name"),
  badge: document.querySelector("#config-badge"),
  settingsLoading: document.querySelector("#settings-loading"),
  settingsForm: document.querySelector("#settings-form"),
  channelSelect: document.querySelector("#channel-select"),
  roleSelect: document.querySelector("#role-select"),
  languageSelect: document.querySelector("#language-select"),
  enabledToggle: document.querySelector("#enabled-toggle"),
  saveButton: document.querySelector("#save-button"),
  deleteButton: document.querySelector("#delete-button"),
  feedback: document.querySelector("#feedback"),
};

const state = {
  guilds: [],
  languages: [],
  config: null,
  resources: null,
  currentGuildId: "",
};

function show(element, visible) {
  element.classList.toggle("hidden", !visible);
}

function setFeedback(message, kind) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback feedback-${kind}`;
}

async function requestJson(url, options) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(options?.headers || {}) },
    ...options,
  });

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function option(label, value) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function fillSelect(select, placeholder, items, selectedValue) {
  select.replaceChildren(option(placeholder, ""));
  for (const item of items) {
    select.append(option(item.name, item.id || item.name));
  }
  if (selectedValue && Array.from(select.options).some((item) => item.value === selectedValue)) {
    select.value = selectedValue;
  }
}

async function loadGuildSettings(guildId) {
  const guild = state.guilds.find((item) => item.id === guildId);
  state.currentGuildId = guildId;
  state.config = null;
  state.resources = null;
  show(elements.settingsPanel, Boolean(guild));
  show(elements.settingsLoading, Boolean(guild));
  show(elements.settingsForm, false);
  show(elements.feedback, false);
  elements.selectedGuildName.textContent = guild?.name || "Choose a server";
  if (!guild) return;

  try {
    const [settingsResponse, resourcesResponse] = await Promise.all([
      requestJson(`/api/guilds/${encodeURIComponent(guildId)}/clan-mission-notification`),
      requestJson(`/api/guilds/${encodeURIComponent(guildId)}/resources`),
    ]);
    if (state.currentGuildId !== guildId) return;

    state.config = settingsResponse.settings;
    state.resources = resourcesResponse;
    fillSelect(elements.channelSelect, "Choose a text channel", resourcesResponse.channels, state.config?.channelId);
    fillSelect(elements.roleSelect, "No role mention", resourcesResponse.roles, state.config?.roleId);
    fillSelect(
      elements.languageSelect,
      "Choose a language",
      state.languages.map((name) => ({ name })),
      state.config?.language || "English"
    );
    elements.enabledToggle.checked = state.config?.enabled ?? true;
    elements.badge.textContent = state.config ? (state.config.enabled ? "Enabled" : "Disabled") : "Not configured";
    elements.badge.classList.toggle("is-enabled", Boolean(state.config?.enabled));
    show(elements.deleteButton, Boolean(state.config));
    show(elements.settingsForm, true);
  } catch (error) {
    if (state.currentGuildId !== guildId) return;
    setFeedback(
      error.status === 401
        ? "Your Discord session expired. Sign out and sign in again."
        : error.message || "Could not load this server's settings.",
      "error"
    );
  } finally {
    if (state.currentGuildId === guildId) show(elements.settingsLoading, false);
  }
}

function setGuildOptions(guilds) {
  elements.guildSelect.replaceChildren(option("Select a server", ""));
  for (const guild of guilds) {
    elements.guildSelect.append(option(guild.name, guild.id));
  }
}

async function initializeDashboard() {
  try {
    const [{ user }, { guilds }, { languages }] = await Promise.all([
      requestJson("/api/me"),
      requestJson("/api/guilds"),
      requestJson("/api/languages"),
    ]);
    state.guilds = guilds;
    state.languages = languages;
    elements.userName.textContent = user.globalName || user.username || "Discord user";
    setGuildOptions(guilds);
    show(elements.dashboard, true);
    show(elements.logout, true);
    show(elements.empty, guilds.length === 0);
    elements.guildSelect.disabled = guilds.length === 0;
    if (guilds.length > 0) {
      elements.guildSelect.value = guilds[0].id;
      await loadGuildSettings(guilds[0].id);
    }
  } catch (error) {
    if (error.status === 401) {
      show(elements.login, true);
      return;
    }
    show(elements.login, true);
    elements.loginError.textContent = error.message || "The dashboard could not connect to its server.";
    show(elements.loginError, true);
  } finally {
    show(elements.loading, false);
  }
}

elements.guildSelect.addEventListener("change", () => {
  loadGuildSettings(elements.guildSelect.value);
});

elements.settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.currentGuildId) return;
  elements.saveButton.disabled = true;
  show(elements.feedback, false);

  try {
    const response = await requestJson(
      `/api/guilds/${encodeURIComponent(state.currentGuildId)}/clan-mission-notification`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: elements.channelSelect.value,
          roleId: elements.roleSelect.value || null,
          enabled: elements.enabledToggle.checked,
          language: elements.languageSelect.value,
        }),
      }
    );
    state.config = response.settings;
    elements.badge.textContent = response.settings.enabled ? "Enabled" : "Disabled";
    elements.badge.classList.toggle("is-enabled", response.settings.enabled);
    show(elements.deleteButton, true);
    setFeedback("Settings saved. The Discord bot will use these shared settings.", "success");
  } catch (error) {
    setFeedback(error.message || "Settings could not be saved.", "error");
  } finally {
    elements.saveButton.disabled = false;
  }
});

elements.deleteButton.addEventListener("click", async () => {
  if (!state.currentGuildId || !window.confirm("Delete this server's clan mission notification settings?")) return;
  elements.deleteButton.disabled = true;

  try {
    const response = await requestJson(
      `/api/guilds/${encodeURIComponent(state.currentGuildId)}/clan-mission-notification`,
      { method: "DELETE" }
    );
    state.config = null;
    elements.badge.textContent = "Not configured";
    elements.badge.classList.remove("is-enabled");
    elements.enabledToggle.checked = true;
    elements.roleSelect.value = "";
    show(elements.deleteButton, false);
    setFeedback(response.deleted ? "Settings deleted." : "There were no settings to delete.", "success");
  } catch (error) {
    setFeedback(error.message || "Settings could not be deleted.", "error");
  } finally {
    elements.deleteButton.disabled = false;
  }
});

elements.logout.addEventListener("click", async () => {
  elements.logout.disabled = true;
  try {
    await requestJson("/auth/logout", { method: "POST" });
    window.location.reload();
  } catch (error) {
    elements.logout.disabled = false;
    show(elements.dashboard, true);
    setFeedback(error.message || "Could not sign out.", "error");
  }
});

initializeDashboard();
