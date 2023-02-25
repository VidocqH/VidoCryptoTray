const {ipcRenderer, contextBridge} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  updateTrayTitle: (ticker) => ipcRenderer.send('update-ticker', ticker),
  getUserConfig: () => ipcRenderer.invoke('get-config'),
  setUserConfig: (editedConfig) => ipcRenderer.send('set-config', editedConfig),
  onWindowToggle: (isWindowOpen) => ipcRenderer.on('is-window-open', isWindowOpen),
  onSetUserConfig: (needRecreateTable) => ipcRenderer.on('on-set-user-config', needRecreateTable),
})

