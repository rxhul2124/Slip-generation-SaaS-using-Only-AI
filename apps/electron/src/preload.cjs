const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sliporaDesktop", {
  getPrinters: () => ipcRenderer.invoke("slipora:get-printers"),
  getConfig: () => ipcRenderer.invoke("slipora:get-config"),
  setConfig: (patch) => ipcRenderer.invoke("slipora:set-config", patch),
  queueOfflineJob: (job) => ipcRenderer.invoke("slipora:queue-offline-job", job)
});
