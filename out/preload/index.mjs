import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("nextTaxAPI", {
  isProduction: process.env.NODE_ENV === "production",
  // Settings
  getSetting: (key) => ipcRenderer.invoke("db:getSetting", key),
  setSetting: (key, value) => ipcRenderer.invoke("db:setSetting", key, value),
  // Categories
  getCategories: (type) => ipcRenderer.invoke("db:getCategories", type),
  // Transactions
  createTransaction: (data) => ipcRenderer.invoke("db:createTransaction", data),
  getTransactions: (filters) => ipcRenderer.invoke("db:getTransactions", filters),
  updateTransaction: (id, data) => ipcRenderer.invoke("db:updateTransaction", id, data),
  deleteTransaction: (id) => ipcRenderer.invoke("db:deleteTransaction", id),
  getSummary: (startDate, endDate) => ipcRenderer.invoke("db:getSummary", startDate, endDate),
  // File operations
  saveReceipt: (sourcePath) => ipcRenderer.invoke("storage:saveReceipt", sourcePath),
  getReceiptPath: (filename) => ipcRenderer.invoke("storage:getReceiptPath", filename),
  deleteReceipt: (filename) => ipcRenderer.invoke("storage:deleteReceipt", filename),
  // Dialogs
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  // Window controls
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  maximizeWindow: () => ipcRenderer.send("window:maximize"),
  closeWindow: () => ipcRenderer.send("window:close")
});
