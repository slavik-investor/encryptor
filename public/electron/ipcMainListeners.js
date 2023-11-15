const { ipcMain, app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { ensureDirectoryExistence } = require('./utils');


function init(mainWindow) {

    ipcMain.on('readFile', (event, filePath) => {
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            event.returnValue = { data };
        } catch (error) {
            event.returnValue = { error: error.message };
        }
    })

    ipcMain.on('exists', (event, filePath) => {
        try {
            const data = fs.existsSync(filePath);
            event.returnValue = { data };
        } catch (error) {
            event.returnValue = { error: error.message };
        }
    })

    ipcMain.on('writeFile', (event, filePath, data) => {
        try {
            fs.writeFileSync(filePath, data);
            event.returnValue = { success: true, path: filePath };
        } catch (error) {
            event.returnValue = { success: false, error: error , path: filePath};
        }
    })

    ipcMain.on('chooseFolder', async(event) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
          });
        
          if (!result.canceled) {
            event.returnValue= {'path': result.filePaths[0]};
          }
    })
}

module.exports = { init }