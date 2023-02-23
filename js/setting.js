let config = undefined

function setColorSetting() {
  if (config.reverseRedGreen) {
    document.getElementById('greenUp').checked=true
  } else {
    document.getElementById('redUp').checked=true
  }
}

function submitConfig() {
  config.reverseRedGreen = document.getElementById('greenUp').checked
  window.electronAPI.setUserConfig(config)
  console.log("Save")
}

window.electronAPI.getUserConfig().then(originConfig => {
  config = originConfig

  setColorSetting()
})

