// Simple obfuscation - not truly secure but better than plaintext
const _0x5a7e = ['QUl6YVN5RE5sNm1IdjJ5M0RUNFVBb3dxV09JLUd6MkwxeHF1eXZn']; // Google Vision API key
const _0x3b2c = ['c2stcHJvai1vSFMyc1dTZE1TZHh6My1jX3RBRkFWbFltbEQ2a25ybUt4eHc2WXU1eG9vN0plSjF6LW9rUy1KOVZ4SGphbjAxdnpSQUZxMEZ3bFQzQmxia0ZKMktrXy1tcS15Z2JPcjhRT3hXV1ZUb0o0T2h3TlRRRE4xTUVkTmJYTFV6M1BtY1hlRGMzeUdmWmRZVHA1aDY3X2hWNHJJZ21IOEE=']; // OpenAI API key

const config = {
  get googleCloudVisionApiKey() {
    try {
      return atob(_0x5a7e[0]); // Decode at runtime
    } catch (error) {
      console.error('Error decoding API key:', error);
      // Fallback to direct key if needed for debugging
      return 'AIzaSyDNl6mHv2y3DT4UAowqWOI-Gz2L1xquyv'; // Replace with your actual key
    }
  },
  get openaiApiKey() {
    try {
      return atob(_0x3b2c[0]); // Decode at runtime
    } catch (error) {
      console.error('Error decoding OpenAI API key:', error);
      return ''; // Replace with your actual key if needed
    }
  },
  ocrLanguage: 'en',
  maxResults: 1,
  openaiModel: 'gpt-4o', // Default to the latest model
  fallbackModels: ['gpt-4', 'gpt-3.5-turbo'], // Fallback models in order of preference
  
  // Helper function to handle model availability
  getAvailableModel: async function() {
    try {
      return this.openaiModel; // Try to use the preferred model first
    } catch (error) {
      console.warn(`Model ${this.openaiModel} not available, trying fallbacks...`);
      // In a real implementation, you would check availability through API
      // For now, just return the first fallback
      return this.fallbackModels[0];
    }
  }
};

// Don't modify this line - it exports the config for use in other files
if (typeof module !== 'undefined') {
  module.exports = config;
} 