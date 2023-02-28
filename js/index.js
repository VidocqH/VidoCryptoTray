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

function getDisplayColor() {
  if (userConfig.reverseRedGreen) {
    return { "down": "red", "up": "green"}
  }
  return { "down": "green", "up": "red" }
}

function setTableAutoUpdate() {
  intervalId = setInterval(() => symbolsTable.setData(), userConfig.tableUpdateInterval)
}

function createTable() {
  symbolsTable = new Tabulator("#symbols-table", {
    ajaxURL: "https://api2.binance.com/api/v3/ticker/24hr",
    ajaxParams: { "symbols": JSON.stringify(userConfig.likedSymbols) },
    ajaxResponse: function(url, params, response) {
      response.forEach(elem => {
        elem.lastPrice = Number(Number(elem.lastPrice).toFixed(userConfig.tablePrecision.price))
        elem.priceChange = (elem.priceChange[0] == "-" ? "" : "+") + Number(Number(elem.priceChange).toFixed(userConfig.tablePrecision.change))
        elem.priceChangePercent = (elem.priceChangePercent[0] == "-" ? "" : "+") + elem.priceChangePercent.slice(0, 4) + '%'
      })
      return response
    },
    dataLoader: false,
    layout:"fitDataStretch",
    layoutColumnsOnNewData:true,
    selectable: true,
    rowHeight: 30,
    columns:[
      { title: "Symbol", field: "symbol", sorter: "string" },
      { title: "Price", field: "lastPrice", sorter: "number" },
      { title: "Change", field: "priceChange", sorter: "number" },
      { title: "Percent", field: "priceChangePercent", sorter: "number" },
    ],
    rowFormatter: (row) => {
      row.getElement().style.color = getDisplayColor()[row.getData().priceChangePercent[0] == "-" ? "down" : "up"]
      if (userConfig.trayTickerSymbols.find(elem => elem.toUpperCase() == row.getData().symbol)) {
        symbolsTable.selectRow(row)
      }
    }
  })

  // Unchange hover row's font color
  symbolsTable.on("rowMouseOver", function (e, row) {
    document
      .querySelectorAll(".tabulator .tabulator-row.tabulator-selectable:hover .tabulator-cell")
      .forEach(elem => {
        elem.style.color = getDisplayColor()[row.getData().priceChange[0] == "-" ? "down" : "up"]
      })
  })

  // Change Tray Symbol Event
  symbolsTable.on("rowClick", function (e, row) {
    userConfig.trayTickerSymbols = Array.from(symbolsTable.getSelectedData()).map(elem => elem = elem.symbol)
    window.electronAPI.updateTrayTitle(userConfig.trayTickerSymbols)
    window.electronAPI.setUserConfig(userConfig)
  }) 

  // Table Right Click Event
  symbolsTable.on("rowContext", function (e, row) {
    const deleteSymbol = row.getCell('symbol').getValue()
    userConfig.likedSymbols = userConfig.likedSymbols.filter(elem => elem != deleteSymbol)
    window.electronAPI.setUserConfig(userConfig)
    displayMessage("positive", "Symbol deleted.")
    e.preventDefault()
  })
}

// Initialize: Read User Config
window.electronAPI.getUserConfig().then((config) => {
  userConfig = config

  // Set Symbols Table
  createTable()

  // Set Symbols Table Refresh
  setTableAutoUpdate()

  // Listen Enter
  document.getElementById("symbolInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      document.getElementById("addBtn").click()
    }
  })
})

window.electronAPI.onWindowToggle((event, isWindowOpen) => {
  if (isWindowOpen) {
    setTableAutoUpdate()
  } else {
    clearInterval(intervalId)
  }
})

window.electronAPI.onSetUserConfig((event, needRecreateTable) => {
  if (needRecreateTable) {
    createTable()
  }
})
