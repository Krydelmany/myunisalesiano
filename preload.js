const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  maximizeWindow: () => ipcRenderer.send('maximize-window')
});
