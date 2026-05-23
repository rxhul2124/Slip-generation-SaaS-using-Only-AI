const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("node:path");
const crypto = require("node:crypto");
const Store = require("electron-store");

const store = new Store({
  name: "packslip-desktop",
  defaults: {
    apiUrl: "http://localhost:5000/api/v1",
    webUrl: "http://localhost:5173",
    offlineQueue: []
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    title: "PackSlip Desktop",
    backgroundColor: "#f7faf9",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const webUrl = process.env.PACKSLIP_WEB_URL || store.get("webUrl");
  win.loadURL(webUrl).catch(() => {
    win.loadFile(path.join(__dirname, "offline.html"));
  });
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(["notifications"].includes(permission));
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("packslip:get-printers", async (event) => event.sender.getPrintersAsync());
ipcMain.handle("packslip:get-config", async () => store.store);
ipcMain.handle("packslip:set-config", async (_event, patch) => {
  for (const [key, value] of Object.entries(patch)) store.set(key, value);
  return store.store;
});
ipcMain.handle("packslip:queue-offline-job", async (_event, job) => {
  const queue = store.get("offlineQueue", []);
  const queued = { ...job, queuedAt: new Date().toISOString(), id: crypto.randomUUID() };
  store.set("offlineQueue", [...queue, queued]);
  return queued;
});
