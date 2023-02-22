const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')
const fs = require('fs')

const RED = '\033[31;1m'
const GREEN = '\033[32;1m'

const DEFAULT_CONFIG = {
  "likedSymbols": ["BTCUSDT", "ETHUSDT"],
  "trayTickerSymbol": "btcusdt",
  "reverseRedGreen": false
}

app.isPackaged || require('electron-reload')(__dirname)

let tray = undefined
let window = undefined
let config = undefined

const configRootPath = path.join(app.getPath('userData'), 'config.json')
// Initialize config
if (!fs.existsSync(configRootPath)) {
  setUserConfig(DEFAULT_CONFIG)
} else {
  config = JSON.parse(fs.readFileSync(configRootPath, 'utf-8'))
}

function setUserConfig(editedConfig) {
  config = editedConfig
  fs.writeFileSync(configRootPath, JSON.stringify(editedConfig))
}

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(path.join(__dirname, 'assets'), 'iconTemplate.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 405,
    height: 280,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      // Prevents renderer process code from not running when window is hidden
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Renderer funcs exposure
  ipcMain.on('update-ticker', (event, ticker) => {
    if (ticker.c < ticker.o)
      tray.setTitle(
        `${GREEN} ${ticker.s} ${Number(ticker.c).toFixed(2)} -${((ticker.o - ticker.c) / ticker.o * 100).toFixed(2)}%`
        )
    else
      tray.setTitle(
        `${RED} ${ticker.s} ${Number(ticker.c).toFixed(2)} +${((ticker.c - ticker.o) / ticker.o * 100).toFixed(2)}%`
        )
  })
  ipcMain.handle('get-config', () => config )
  ipcMain.on('set-config', (event, config) => setUserConfig(config))

  // Load window page
  window.loadFile('views/index.html')

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

// TODO: set tooltip

