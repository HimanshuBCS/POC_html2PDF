const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');


const fs = require('fs');
const os = require('os');
const ipc = electron.ipcMain;
const shell = electron.shell;


require('electron-reload')(__dirname);

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipc.on('print-to-pdf', function(event) {
  const pdfpath = path.join(os.tmpdir(), 'print.pdf');
  const win = BrowserWindow.fromWebContents(event.sender);
  
  win.webContents.printToPDF({}, function(error, data) {
    if (error) return console.log(error.message);

    fs.writeFile(pdfpath, data, function(err) {
      if(err) return console.log(err.message);
      shell.openExternal('file://' + pdfpath);
      event.sender.send('wrote-pdf', pdfpath);
    })
  })  
});