const { app, BrowserWindow, desktopCapturer, session, clipboard } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { formatText } = require('./text-processor');
const { handleOcr } = require('./ocr');

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
