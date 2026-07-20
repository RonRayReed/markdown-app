const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const { fileURLToPath } = require("node:url");

const appIconPath = path.join(__dirname, "assets", "reed-intel.ico");
let isQuitting = false;

function safeFileName(value) {
  return String(value || "Untitled")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function recoveryPath() {
  return path.join(app.getPath("userData"), "recovery.json");
}

function defaultBackupFolder() {
  return path.join(app.getPath("documents"), "Reed Intel Markdown Backups");
}

function createEditorContextMenu(win, params) {
  const menuItems = [];

  if (params.misspelledWord) {
    const suggestions = params.dictionarySuggestions || [];

    if (suggestions.length) {
      suggestions.slice(0, 8).forEach((suggestion) => {
        menuItems.push({
          label: suggestion,
          click: () => {
            win.webContents.send("spellcheck:replace", {
              suggestion,
              misspelledWord: params.misspelledWord,
              x: params.x,
              y: params.y
            });
          }
        });
      });
    } else {
      menuItems.push({
        label: "No spelling suggestions",
        enabled: false
      });
    }

    menuItems.push({
      label: `Add "${params.misspelledWord}" to Dictionary`,
      click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
    });
    menuItems.push({ type: "separator" });
  }

  if (params.isEditable || params.selectionText) {
    menuItems.push(
      { role: "undo", enabled: params.isEditable },
      { role: "redo", enabled: params.isEditable },
      { type: "separator" },
      { role: "cut", enabled: params.isEditable },
      { role: "copy", enabled: Boolean(params.selectionText) },
      { role: "paste", enabled: params.isEditable },
      { role: "selectAll" }
    );
  }

  if (!menuItems.length) return;
  Menu.buildFromTemplate(menuItems).popup({ window: win });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 920,
    minHeight: 620,
    title: "Reed Intel Markdown",
    icon: appIconPath,
    backgroundColor: "#111111",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true
    }
  });

  win.webContents.on("context-menu", (_event, params) => {
    createEditorContextMenu(win, params);
  });

  win.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    win.webContents.send("app:close-requested");
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

function createApplicationMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          accelerator: "Ctrl+O",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu:file", "open");
          }
        },
        {
          label: "Save",
          accelerator: "Ctrl+S",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu:file", "save");
          }
        },
        {
          label: "Save As",
          accelerator: "Ctrl+Shift+S",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu:file", "saveAs");
          }
        },
        { type: "separator" },
        {
          label: "Close",
          accelerator: "Alt+F4",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu:file", "closeApp");
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { type: "separator" },
        {
          label: "About Reed Intel Markdown",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu:view", "about");
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.setAppUserModelId("com.reedintel.markdown");

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("app:quit", () => {
  isQuitting = true;
  app.quit();
});

ipcMain.handle("file:open", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open Markdown File",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Markdown and Text", extensions: ["md", "markdown", "mdown", "txt"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });

  if (result.canceled) return [];

  const files = await Promise.all(
    result.filePaths.map(async (filePath) => ({
      path: filePath,
      name: path.basename(filePath),
      content: await fs.readFile(filePath, "utf8")
    }))
  );

  return files;
});

async function walkMarkdownFiles(dirPath, limit = 1000) {
  const found = [];
  const queue = [dirPath];

  while (queue.length && found.length < limit) {
    const current = queue.shift();
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", "dist"].includes(entry.name)) queue.push(entryPath);
      } else if (/\.(md|markdown|mdown|txt)$/i.test(entry.name)) {
        found.push(entryPath);
        if (found.length >= limit) break;
      }
    }
  }

  return found;
}

ipcMain.handle("folder:open", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open Markdown Folder",
    properties: ["openDirectory"]
  });

  if (result.canceled || !result.filePaths[0]) return null;
  const folderPath = result.filePaths[0];
  const filePaths = await walkMarkdownFiles(folderPath);
  return {
    folderPath,
    files: filePaths.map((filePath) => ({
      path: filePath,
      name: path.basename(filePath)
    }))
  };
});

ipcMain.handle("folder:search", async (_event, folderPath, query) => {
  const cleanQuery = String(query || "").trim().toLowerCase();
  if (!folderPath || !cleanQuery) return [];

  const filePaths = await walkMarkdownFiles(folderPath);
  const results = [];

  for (const filePath of filePaths) {
    let content = "";
    try {
      content = await fs.readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(cleanQuery)) {
        results.push({
          path: filePath,
          name: path.basename(filePath),
          line: index + 1,
          excerpt: line.trim().slice(0, 220)
        });
      }
    });

    if (results.length >= 300) break;
  }

  return results;
});

ipcMain.handle("file:read", async (_event, filePath) => ({
  path: filePath,
  name: path.basename(filePath),
  content: await fs.readFile(filePath, "utf8")
}));

ipcMain.handle("file:save", async (_event, file) => {
  let targetPath = file.path;

  if (!targetPath) {
    const result = await dialog.showSaveDialog({
      title: "Save Markdown File",
      defaultPath: file.name || "Untitled.md",
      filters: [
        { name: "Markdown", extensions: ["md"] },
        { name: "Text", extensions: ["txt"] }
      ]
    });

    if (result.canceled || !result.filePath) return null;
    targetPath = result.filePath;
  }

  await fs.writeFile(targetPath, file.content, "utf8");
  return {
    path: targetPath,
    name: path.basename(targetPath)
  };
});

ipcMain.handle("file:saveAs", async (_event, file) => {
  const result = await dialog.showSaveDialog({
    title: "Save Markdown File As",
    defaultPath: file.name || "Untitled.md",
    filters: [
      { name: "Markdown", extensions: ["md"] },
      { name: "Text", extensions: ["txt"] }
    ]
  });

  if (result.canceled || !result.filePath) return null;

  await fs.writeFile(result.filePath, file.content, "utf8");
  return {
    path: result.filePath,
    name: path.basename(result.filePath)
  };
});

ipcMain.handle("file:rename", async (_event, file, nextName) => {
  const cleanName = String(nextName || "").trim();
  if (!cleanName) return null;

  if (!file.path) {
    return {
      path: null,
      name: cleanName
    };
  }

  const nextPath = path.join(path.dirname(file.path), cleanName);
  if (nextPath !== file.path) {
    await fs.rename(file.path, nextPath);
  }

  return {
    path: nextPath,
    name: path.basename(nextPath)
  };
});

ipcMain.handle("file:delete", async (_event, file) => {
  if (!file.path) return true;
  await fs.unlink(file.path);
  return true;
});

ipcMain.handle("file:pickLink", async () => {
  const result = await dialog.showOpenDialog({
    title: "Choose File to Link",
    properties: ["openFile"],
    filters: [{ name: "All Files", extensions: ["*"] }]
  });

  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle("path:open", async (_event, targetPath) => {
  if (!targetPath) return;
  const pathToOpen = targetPath.startsWith("file://") ? fileURLToPath(targetPath) : targetPath;
  await shell.openPath(pathToOpen);
});

ipcMain.handle("backup:chooseFolder", async () => {
  const result = await dialog.showOpenDialog({
    title: "Choose Backup Folder",
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle("backup:getDefaultFolder", async () => defaultBackupFolder());

ipcMain.handle("backup:loadRecovery", async () => {
  try {
    const raw = await fs.readFile(recoveryPath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
});

ipcMain.handle("backup:writeRecovery", async (_event, payload) => {
  await ensureDir(app.getPath("userData"));
  await fs.writeFile(recoveryPath(), JSON.stringify(payload, null, 2), "utf8");
  return true;
});

ipcMain.handle("backup:writeCopies", async (_event, pages, folderPath) => {
  const targetFolder = folderPath || defaultBackupFolder();
  await ensureDir(targetFolder);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  await Promise.all(
    pages.map((page) => {
      const baseName = safeFileName(page.name || "Untitled.md").replace(/\.md$/i, "");
      const targetPath = path.join(targetFolder, `${baseName}.${timestamp}.md`);
      return fs.writeFile(targetPath, page.content || "", "utf8");
    })
  );

  return targetFolder;
});
