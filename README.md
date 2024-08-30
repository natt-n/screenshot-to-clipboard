Tool that captures English Slack conversations and retrieves the message text.

Implementation Plan: 
Create a tool that can apply OCR to a provided image and copy the generated text from the image to the user clipboard. 

Tools: 
- Tesseract.js to retrieve text from an image
- Regex to process the text into readable format
- Electron.js to allow automated functionality by observing directory for changes

Improvements
- Incorporate tool for other native environments
- Design better regex rules for post processing
- Find a way to implement spell-checker and use of English dictionary to autocorrect
      - Tried with typo.js and npm spell-checker but processing time is very long (maybe O(n^2) to linear search the whole dictionary for each word in the generated text
- Add a notification to inform user that text is copied to clipboard
- Add action: after text is copied to clipboard, delete the image that was captured. 
