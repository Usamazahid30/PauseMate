const { app, Tray, Menu, BrowserWindow, Notification } = require("electron");
const path = require("path");
const fs = require("fs");
const { showBlockScreen } = require("./blocker");
app.disableHardwareAcceleration();

let tray;
let settingsPath = path.join(__dirname, "settings.json");
const logFilePath = path.join(__dirname, "app.log");

function logEvent(message) {
  const timestamp = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, "utf8");
}

let defaultSettings = {
  blockIntervalMinutes: 20,
  blockDurationSeconds: 20,
  enabled: true,
};

let settings = fs.existsSync(settingsPath)
  ? JSON.parse(fs.readFileSync(settingsPath))
  : defaultSettings;

if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
}

let intervalId;
let settingsWindow = null;
let isPaused = false;

function notifyBreak() {
  if (Notification.isSupported()) {
    new Notification({
      title: "PauseMate Reminder",
      body: "Your break is about to start. Get ready to relax!",
      icon: path.join(__dirname, "assets/icon.png"),
    }).show();
    logEvent("Break notification sent.");
  }
}

function startTimer() {
  clearInterval(intervalId);
  logEvent("Timer started.");
  intervalId = setInterval(() => {
    if (settings.enabled) {
      notifyBreak(); // Notify the user
      setTimeout(() => {
        app.focus();
        showBlockScreen(settings.blockDurationSeconds);
        logEvent("Block screen displayed.");
      }, 5000); // Show blocker screen after 5 seconds
    }
  }, settings.blockIntervalMinutes * 60 * 1000);
}

function togglePauseMate() {
  settings.enabled = !settings.enabled;
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  updateTray();
  if (settings.enabled) {
    startTimer();
    logEvent("PauseMate enabled.");
  } else {
    clearInterval(intervalId);
    logEvent("PauseMate disabled.");
  }
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(intervalId);
    tray.setToolTip("PauseMate (Paused)");
    logEvent("PauseMate paused.");
  } else {
    startTimer();
    tray.setToolTip("PauseMate");
    logEvent("PauseMate resumed.");
  }
  updateTray();
}

function openSettingsInfo() {
  if (settingsWindow) {
    settingsWindow.focus();
    logEvent("Settings window focused.");
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 350,
    resizable: false,
    title: "PauseMate Settings",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, "ui/index.html"));
  logEvent("Settings window opened.");

  settingsWindow.on("closed", () => {
    settingsWindow = null;
    logEvent("Settings window closed.");
  });
}

function updateTray() {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: settings.enabled
        ? isPaused
          ? "Resume PauseMate"
          : "Pause PauseMate"
        : "Start PauseMate",
      click: settings.enabled ? togglePause : togglePauseMate,
    },
    { label: "Settings", click: openSettingsInfo },
    { type: "separator" },
    { label: "Exit", click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  logEvent("Application started.");
  tray = new Tray(path.join(__dirname, "assets/icon.png"));
  tray.setToolTip("PauseMate");
  updateTray();

  if (settings.enabled) {
    startTimer();
  }

  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
    args: [],
  });
});

// ✅ Prevent quitting the app when windows are closed
app.on("window-all-closed", (e) => {
  // Do nothing — keep app running in tray
});

app.on("activate", () => {
  // macOS specific, but safe to include
  if (BrowserWindow.getAllWindows().length === 0 && settings.enabled) {
    startTimer();
  }
});

process.on("uncaughtException", (error) => {
  logEvent(`Uncaught Exception: ${error.message}`);
});

process.on("unhandledRejection", (reason) => {
  logEvent(`Unhandled Rejection: ${reason}`);
});
