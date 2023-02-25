const {app, BrowserWindow, ipcMain, Tray, nativeImage} = require('electron')
const path = require('path')
const fs = require('fs')
const WebSocket = require('ws')

const DEFAULT_CONFIG = {
  "likedSymbols": ["BTCUSDT", "ETHUSDT"],
  "trayTickerSymbol": "btcusdt",
  "reverseRedGreen": false
}

// Electron Hot Reload when in development
app.isPackaged || require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
})

let tray = undefined
let window = undefined
let config = undefined
let socket = undefined
let color_set = undefined

const ICON_ROOT_PATH = path.join(__dirname, "node_modules/cryptocurrency-icons/32/white")
const DEFAULT_COIN_ICON = 
  nativeImage
    .createFromPath(path.join(ICON_ROOT_PATH, "generic.png"))
    .resize({ "width": 18, "height": 18 })
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json')
const ASSET_PATH = path.join(__dirname, 'assets')

// Initialize config
if (!fs.existsSync(CONFIG_PATH)) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG), 'utf-8')
  config = DEFAULT_CONFIG
} else {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}
updateColorSet()

function updateColorSet() {
  const RED = '\033[31;1m'
  const GREEN = '\033[32;1m'
  color_set = config.reverseRedGreen ? { "up": GREEN, "down": RED } : { "up": RED, "down": GREEN }
}

function setUserConfig(editedConfig) {
  config = editedConfig
  window.webContents.send('recreate-table')
  updateColorSet()
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(editedConfig))
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
  tray = new Tray(path.join(ASSET_PATH, 'iconTemplate.png'))
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

function subscribeWebSocketAndUpdateTray(symbol) {
  // Get Coin Icon
  fetch(`https://api2.binance.com/api/v3/exchangeInfo?symbol=${symbol.toUpperCase()}`)
    .then(response => response.json())
    .then(result => {
      const baseAsset = result.symbols[0].baseAsset
      const icon = nativeImage
        .createFromPath(path.join(ICON_ROOT_PATH, baseAsset.toLowerCase() + '.png'))
        .resize({"width": 18, "height": 18})
      tray.setImage(icon.isEmpty() ? DEFAULT_COIN_ICON : icon)
    })
    .catch(error => console.error(error))

  // Subscribe
  socket = new WebSocket(`wss://data-stream.binance.com/ws/${symbol || "btcusdt"}@ticker`)
  socket.onmessage = (event) => {
    const ticker = JSON.parse(event.data)
    if (ticker.c < ticker.o) {
      tray.setTitle(`${color_set.down} ${ticker.s} ${Number(ticker.c).toFixed(2)} ${Number(ticker.P).toFixed(2)}%`)
    } else {
      tray.setTitle(`${color_set.up} ${ticker.s} ${Number(ticker.c).toFixed(2)} +${Number(ticker.P).toFixed(2)}%`)
    }
  }
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

  // Initialize Tray after window created
  subscribeWebSocketAndUpdateTray(config.trayTickerSymbol)

  // Renderer funcs exposure
  ipcMain.on('update-ticker', (event, ticker) => {
    socket.close()
    subscribeWebSocketAndUpdateTray(ticker)
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
  window.webContents.send('is-window-open', window.isVisible())
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

