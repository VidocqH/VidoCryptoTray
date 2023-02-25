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

function setTrayDisplayField() {
  const checkBoxes = document.getElementsByName('display-field')
  console.log(config)
  checkBoxes[0].checked = config.trayShowField.symbol
  checkBoxes[1].checked = config.trayShowField.price
  checkBoxes[2].checked = config.trayShowField.change
  checkBoxes[3].checked = config.trayShowField.percentage
}

function submitConfig() {
  config.reverseRedGreen = document.getElementById('greenUp').checked
  config.tableUpdateInterval = document.getElementById('tableUpdateInterval').value * 1000
  const checkBoxes = document.getElementsByName('display-field')
  config.trayShowField.symbol = checkBoxes[0].checked
  config.trayShowField.price = checkBoxes[1].checked
  config.trayShowField.change = checkBoxes[2].checked
  config.trayShowField.percentage = checkBoxes[3].checked
  window.electronAPI.setUserConfig(config)
}

window.electronAPI.getUserConfig().then(originConfig => {
  config = originConfig

  setColorSetting()
  setTableUpdateInterval()
  setTrayDisplayField()
})

