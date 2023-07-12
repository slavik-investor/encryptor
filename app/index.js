const { app, BrowserWindow } = require('electron');
const path = require('path')
const createWindow = () => {

  const mainWindow = new BrowserWindow({
    width: 700,
    height: 500,
    resizable: true,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false

    }
  })
  mainWindow.setIcon(path.join(__dirname, '../assets/img/logo.png'));
  mainWindow.loadFile('index.html');
  //mainWindow.removeMenu();
}



app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

