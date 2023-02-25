const TRAY_SHOW_FIELD = ['symbol', 'price', 'change', 'percentage']

let config = undefined

function getColorSetting() {
  const checkBoxes = document.getElementsByName('color')
  checkBoxes[config.reverseRedGreen ? 1 : 0].checked = true
}

function setColorSetting() {
  config.reverseRedGreen = document.getElementsByName('color')[1].checked
}

function getTableUpdateInterval() {
  document.getElementById('tableUpdateInterval').value = config.tableUpdateInterval / 1000
}

function setTableUpdateInterval() {
  config.tableUpdateInterval = document.getElementById('tableUpdateInterval').value * 1000
}

function getTrayDisplayField() {
  const checkBoxes = document.getElementsByName('display-field')
  TRAY_SHOW_FIELD.forEach((field, index) => {
    checkBoxes[index].checked = config.trayShowField[field]
  })
}

function setTrayDisplayField() {
  const checkBoxes = document.getElementsByName('display-field')
  TRAY_SHOW_FIELD.forEach((field, index) => {
    config.trayShowField[field] = checkBoxes[index].checked
  })
}

function submitConfig() {
  setColorSetting()
  setTableUpdateInterval()
  setTrayDisplayField()
  window.electronAPI.setUserConfig(config)
}

window.electronAPI.getUserConfig().then(originConfig => {
  config = originConfig

  // Read config and set the value
  getColorSetting()
  getTableUpdateInterval()
  getTrayDisplayField()
})

