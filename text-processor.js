const formatLine = (line) => { 
    const words = line.split(' ');
  
    for (let i = 0; i < words.length; i++) {
      if (/^[^a-zA-Z0-9]*$/.test(words[i])) { // If word is not alphanumeric
        words[i] = "";
      } else if (words[i].length === 1 && words[i] !== "I") {
        words[i] = "";
      } else {
        break;
      }
    }
    return words.join(' ');
  };
  
  const formatText = (text) => {
    if (!text) return '';
  
    const lines = text.split('\n');
    
    const formattedLines = lines.map(line => {
      if(/(?=.*\b[A-Z][a-z]*\b)(?=.*\b\d{1,2}:\d{2}(?:[ap]m)?\b)/.test(formatLine(line))){
        return `${formatLine(line)} \n`;
      }
  
      if(/^(?=.*\b[A-Z][a-z]*\b)(?=.*\b\d{1,2}(?:st|nd|rd|th)\b)/.test(formatLine(line))){
        return `${formatLine(line)} \n`;
      }
  
      return `\t ${formatLine(line)}`;
    });

    console.log(formattedLines);
  
    return formattedLines.join('\n');
  };
  
  module.exports = { formatText };
  
  