const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("packslipDesktop", {
  getPrinters: () => ipcRenderer.invoke("packslip:get-printers"),
  getConfig: () => ipcRenderer.invoke("packslip:get-config"),
  setConfig: (patch) => ipcRenderer.invoke("packslip:set-config", patch),
  queueOfflineJob: (job) => ipcRenderer.invoke("packslip:queue-offline-job", job)
});
