let socket = undefined
let symbolsTable = undefined
let intervalId = undefined
let userConfig = undefined

function addSymbol() {
  const symbol = document.getElementById("symbolInput").value.toUpperCase()
  if (symbol == "") {
    displayMessage("negative", "Symbol is empty.")
    return
  }
  if (userConfig.likedSymbols.find((existedSymbol) => existedSymbol == symbol)) {
    displayMessage("negative", "Symbol already existed.")
    return
  }

  fetch(`https://api2.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
    .then(response => response.json())
    .then(result => {
      if (result.code) {
        displayMessage("negative", result.msg)
        return
      }
      userConfig.likedSymbols.push(symbol)
      window.electronAPI.setUserConfig(userConfig)
      displayMessage("positive", "Symbol added.")
    })
    .catch(error => {
      console.error(error)
    })
}

function subscribeWebSocketAndUpdateTray() {
  // Be sure close existing connection
  if (this.socket) {
    this.socket.close()
  }

  this.socket = new WebSocket(`wss://data-stream.binance.com/ws/${userConfig.trayTickerSymbol || "btcusdt"}@ticker`)
  this.socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    window.electronAPI.updateTrayTitle(data)
  }
}

function displayMessage(type, text) {
  const messageElem = document.getElementById("message")
  document.getElementById("messageText").innerText = text
  messageElem.classList.remove("hidden")
  messageElem.classList.add(type)
  setTimeout(() => {
    messageElem.classList.add("hidden")
    messageElem.classList.remove(type)
  }, 1500)
}

// Read User Config
window.electronAPI.getUserConfig().then((config) => {
  userConfig = config

  // Set symbols table
  symbolsTable = new Tabulator("#symbols-table", {
    ajaxURL: "https://api2.binance.com/api/v3/ticker/24hr",
    ajaxParams: { "symbols": JSON.stringify(userConfig.likedSymbols) },
    ajaxResponse: function(url, params, response) {
      response.forEach(elem => {
        elem.symbol = elem.symbol
        elem.lastPrice = Number(elem.lastPrice).toFixed(4)
        elem.priceChange = (elem.priceChange[0] == "-" ? "" : "+") + Number(elem.priceChange).toFixed(4)
        elem.priceChangePercent = (elem.priceChange[0] == "-" ? "" : "+") + elem.priceChangePercent.slice(0, 5) + '%'
      })
      return response
    },
    dataLoader: false,
    rowHeight: 30,
    columns:[
      {title:"Symbol", field:"symbol"},
      {title:"Price", field:"lastPrice", sorter:"number"},
      {title:"Change", field:"priceChange", sorter:"number"},
      {title:"Percent", field:"priceChangePercent", sorter:"number"},
    ],
    // movableRows: true,
    rowFormatter: (row) => row.getElement().style.color = row.getData().priceChange[0] == "-" ? "#33b040" : "#ff0000",
  })

  // Change Tray Symbol Event
  symbolsTable.on("rowClick", function(e, row){
    userConfig.trayTickerSymbol = row.getCell('symbol').getValue().toLowerCase()
    window.electronAPI.setUserConfig(userConfig)
    subscribeWebSocketAndUpdateTray()
  })
  intervalId = setInterval(() => symbolsTable.setData(), 5000)

  // Set Tray
  document.addEventListener('DOMContentLoaded', subscribeWebSocketAndUpdateTray())

  // Listen Enter
  document.getElementById("symbolInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      document.getElementById("addBtn").click()
    }
  })
})

