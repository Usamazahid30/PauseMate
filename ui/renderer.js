const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

const settingsPath = path.join(__dirname, "..", "settings.json");

const intervalInput = document.getElementById("interval");
const durationInput = document.getElementById("duration");
const enabledCheckbox = document.getElementById("enabled");
const saveBtn = document.getElementById("saveBtn");

const settings = JSON.parse(fs.readFileSync(settingsPath));
intervalInput.value = settings.blockIntervalMinutes;
durationInput.value = settings.blockDurationSeconds;
enabledCheckbox.checked = settings.enabled;

saveBtn.addEventListener("click", () => {
  const updatedSettings = {
    blockIntervalMinutes: parseInt(intervalInput.value),
    blockDurationSeconds: parseInt(durationInput.value),
    enabled: enabledCheckbox.checked,
  };

  fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));
  alert("Settings saved! Please restart the app for changes to apply.");
});

document.getElementById("save-settings").addEventListener("click", () => {
  const blockIntervalMinutes = parseInt(
    document.getElementById("interval").value,
    10
  );
  const blockDurationSeconds = parseInt(
    document.getElementById("duration").value,
    10
  );

  ipcRenderer.send("update-settings", {
    blockIntervalMinutes,
    blockDurationSeconds,
  });
});
