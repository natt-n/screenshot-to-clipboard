const { app, BrowserWindow, desktopCapturer, session, clipboard, Menu, Tray } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { formatText } = require('./text-processor');
const { handleOcr } = require('./ocr');

let tray = null;
let mainWindow = null;

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    show: false, // Start hidden
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  tray = new Tray('./icon.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('My Electron App');
  tray.setContextMenu(contextMenu);

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      // Grant access to the first screen found.
      callback({ video: sources[0], audio: 'loopback' });
    });
  });

  // Determine the default screenshot directory on macOS
  exec('defaults read com.apple.screencapture location', (err, stdout) => {
    let screenshotDir;
    if (err) {
      console.error('Error reading screenshot location:', err);
      // Fallback to the default Desktop directory
      screenshotDir = path.join(os.homedir(), 'Desktop');
    } else {
      screenshotDir = stdout.trim() || path.join(os.homedir(), 'Desktop');
    }

    // Watch the screenshot directory for new files
    fs.watch(screenshotDir, async (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        const filePath = path.join(screenshotDir, filename);
        try {
          const stats = await fs.promises.stat(filePath);
          if (stats.isFile()) {
            console.log(`New screenshot detected: ${filePath}`);

            // Apply OCR to the filepath
            const text = await handleOcr(filePath);

            // Format the text
            const formattedText = formatText(text);

            // Write formatted text to clipboard
            clipboard.writeText(formattedText);
            console.log('Formatted text copied to clipboard:', formattedText);
          }
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }
    });
  });
});

app.on('window-all-closed', (event) => {
  event.preventDefault(); // Prevent the app from quitting when all windows are closed
});
