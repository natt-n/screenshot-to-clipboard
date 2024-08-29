const { app, BrowserWindow, desktopCapturer, session } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow();

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      // Grant access to the first screen found.
      callback({ video: sources[0], audio: 'loopback' });
    });
  });

  mainWindow.loadFile('index.html');

  // Determine the default screenshot directory on macOS
  exec(
    'defaults read com.apple.screencapture location',
    (err, stdout, stderr) => {
      let screenshotDir;
      if (err) {
        console.error('Error reading screenshot location:', err);
        // Fallback to the default Desktop directory
        screenshotDir = path.join(os.homedir(), 'Desktop');
      } else {
        screenshotDir = stdout.trim() || path.join(os.homedir(), 'Desktop');
      }

      // Watch the screenshot directory for new files
      fs.watch(screenshotDir, (eventType, filename) => {
        if (eventType === 'rename' && filename) {
          const filePath = path.join(screenshotDir, filename);
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error(err);
              return;
            }
            if (stats.isFile()) {
              console.log(`New screenshot detected: ${filename}`);
              // You can add additional logic here to handle the new screenshot
            }
          });
        }
      });
    }
  );
});
