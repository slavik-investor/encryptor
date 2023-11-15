const { app, BrowserWindow, Menu, shell } = require('electron');
const ipcMainListeners = require('./electron/ipcMainListeners');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 450,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity:false
        }
    })

    mainWindow.setIcon(path.join(__dirname, './img/white.png'));

    const startUrl = `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startUrl);

    

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
      });

    if (isDev === false) mainWindow.removeMenu();

    if (process.platform === 'darwin' && isDev === false) {
        const template = [{ role: 'editMenu' }];
        template.unshift({ label: 'editMenu' });
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    
    ipcMainListeners.init(mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
})
