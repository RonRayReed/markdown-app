const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("reedIntel", {
  openFiles: () => ipcRenderer.invoke("file:open"),
  openFolder: () => ipcRenderer.invoke("folder:open"),
  searchFolder: (folderPath, query) => ipcRenderer.invoke("folder:search", folderPath, query),
  readFile: (filePath) => ipcRenderer.invoke("file:read", filePath),
  saveFile: (file) => ipcRenderer.invoke("file:save", file),
  saveFileAs: (file) => ipcRenderer.invoke("file:saveAs", file),
  renameFile: (file, nextName) => ipcRenderer.invoke("file:rename", file, nextName),
  deleteFile: (file) => ipcRenderer.invoke("file:delete", file),
  pickLink: () => ipcRenderer.invoke("file:pickLink"),
  openPath: (targetPath) => ipcRenderer.invoke("path:open", targetPath),
  chooseBackupFolder: () => ipcRenderer.invoke("backup:chooseFolder"),
  getDefaultBackupFolder: () => ipcRenderer.invoke("backup:getDefaultFolder"),
  loadRecovery: () => ipcRenderer.invoke("backup:loadRecovery"),
  writeRecovery: (payload) => ipcRenderer.invoke("backup:writeRecovery", payload),
  writeBackupCopies: (pages, folderPath) => ipcRenderer.invoke("backup:writeCopies", pages, folderPath),
  quitApp: () => ipcRenderer.invoke("app:quit"),
  onFileMenu: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("menu:file", listener);
    return () => ipcRenderer.removeListener("menu:file", listener);
  },
  onViewMenu: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("menu:view", listener);
    return () => ipcRenderer.removeListener("menu:view", listener);
  },
  onCloseRequested: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("app:close-requested", listener);
    return () => ipcRenderer.removeListener("app:close-requested", listener);
  },
  onSpellcheckReplace: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("spellcheck:replace", listener);
    return () => ipcRenderer.removeListener("spellcheck:replace", listener);
  }
});
