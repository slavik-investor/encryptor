const { createNotification } = require("./logger");
const { ipcRenderer } = window.require('electron');


function init() {

    ipcRenderer.on('notification',(event, log, type) => {
        createNotification(log, type);
    });

    ipcRenderer.on('error',(event, log) => {
        createNotification(`ERROR | ${log}`);
    });
}

module.exports = {init}