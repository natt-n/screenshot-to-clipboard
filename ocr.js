const Tesseract = require('tesseract.js');

async function handleOcr(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng', // You can change the language here
      {
        logger: m => console.log(m), // Optional logger
      }
    );
    return text;
  } catch (error) {
    console.error('Error during OCR processing:', error);
    throw error;
  }
}

module.exports = { handleOcr };

