const elements = {
  loading: document.querySelector("#loading-state"),
  authNotice: document.querySelector("#auth-notice"),
  login: document.querySelector("#login-state"),
  loginError: document.querySelector("#login-error"),
  connectDiscord: document.querySelector("#connect-discord-state"),
  connectDiscordCopy: document.querySelector("#connected-account-copy"),
  connectDiscordButton: document.querySelector("#connect-discord-button"),
  connectError: document.querySelector("#connect-error"),
  accountLogout: document.querySelector("#account-logout-button"),
  googleButton: document.querySelector("#google-button"),
  googleLabel: document.querySelector("#google-label"),
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

function showAuthError(message) {
  elements.loginError.textContent = message;
  show(elements.loginError, true);
}

async function loadProviderStatus() {
  try {
    const providers = await requestJson("/auth/providers");
    elements.googleButton.disabled = !providers.google;
    elements.googleLabel.textContent = providers.google
      ? "Continue with Google"
      : "Google sign-in is not configured";
    if (providers.google) {
      elements.googleButton.setAttribute("aria-label", "Continue with Google");
    } else {
      elements.googleButton.setAttribute("aria-label", "Google sign-in is not configured");
    }
  } catch (error) {
    showAuthError(error.message || "Sign-in options could not be loaded.");
  }
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
  const authError = new URLSearchParams(window.location.search).get("auth_error");
  if (authError) window.history.replaceState(null, "", window.location.pathname);
  if (authError === "google_account_conflict") {
    elements.authNotice.textContent =
      "A website account already uses that Google email. No accounts were linked; contact the site administrator to resolve the conflict.";
    show(elements.authNotice, true);
  }

  try {
    const { user, account } = await requestJson("/api/me");
    if (!user) {
      if (account) {
        const providers = await requestJson("/auth/providers");
        elements.connectDiscordCopy.textContent = providers.discord
          ? `Your website account (${account.email}) is ready. Connect Discord to verify server access and manage notifications.`
          : `Your website account (${account.email}) is ready. Google sign-in is active, and Discord can be connected later when the site is configured.`;
        show(elements.connectDiscord, true);
        if (!providers.discord) {
          elements.connectDiscordButton.removeAttribute("href");
          elements.connectDiscordButton.setAttribute("aria-disabled", "true");
          elements.connectDiscordButton.textContent = "Connect Discord";
          elements.connectDiscordButton.title = "Discord sign-in is not configured for this website";
        } else {
          elements.connectDiscordButton.textContent = "Connect Discord";
          elements.connectDiscordButton.removeAttribute("title");
        }
      } else {
        show(elements.login, true);
        await loadProviderStatus();
      }
      return;
    }

    const [{ guilds }, { languages }] = await Promise.all([
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
      await loadProviderStatus();
      return;
    }
    show(elements.login, true);
    await loadProviderStatus();
    if (!elements.loginError.textContent) {
      showAuthError(error.message || "The dashboard could not connect to its server.");
    }
  } finally {
    show(elements.loading, false);
  }
}

elements.googleButton.addEventListener("click", () => {
  if (!elements.googleButton.disabled) window.location.assign("/auth/google");
});

elements.accountLogout.addEventListener("click", async () => {
  elements.accountLogout.disabled = true;
  try {
    await requestJson("/auth/logout", { method: "POST" });
    window.location.reload();
  } catch (error) {
    elements.connectError.textContent = error.message || "Could not sign out.";
    show(elements.connectError, true);
    elements.accountLogout.disabled = false;
  }
});

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
