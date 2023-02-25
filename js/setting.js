let config = undefined

function setColorSetting() {
  if (config.reverseRedGreen) {
    document.getElementById('greenUp').checked=true
  } else {
    document.getElementById('redUp').checked=true
  }
}

function setTableUpdateInterval() {
  document.getElementById('tableUpdateInterval').value = config.tableUpdateInterval / 1000
}

function submitConfig() {
  config.reverseRedGreen = document.getElementById('greenUp').checked
  config.tableUpdateInterval = document.getElementById('tableUpdateInterval').value * 1000
  window.electronAPI.setUserConfig(config)
}

window.electronAPI.getUserConfig().then(originConfig => {
  config = originConfig

  setColorSetting()
  setTableUpdateInterval()
})

