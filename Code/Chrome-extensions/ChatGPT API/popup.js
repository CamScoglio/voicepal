// Constants
const STATUS_MESSAGES = {
  CAPTURING: 'Capturing screen...',
  PROCESSING: 'Processing OCR...',
  CLEANING: 'Cleaning text with ChatGPT...',
  ANALYZING: 'Analyzing text with ChatGPT...',
  SUCCESS: 'Analysis complete!',
  ERROR: 'Error: '
};

// Initialize DOM elements after content is loaded
document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        getAnswerButton: document.getElementById('getAnswer'),
        statusDiv: document.getElementById('status'),
        answerDiv: document.getElementById('answer'),
        loader: document.querySelector('.loader'),
        sandboxFrame: document.getElementById('sandboxFrame')
    };
    
    let sandboxReady = false;
    
    // Listen for messages from the sandbox
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data.action, event.data.stage);
        
        if (event.data.action === 'sandboxReady') {
            sandboxReady = true;
            console.log('Sandbox is ready');
        } else if (event.data.action === 'ocrProgress') {
            // Update progress status
            elements.statusDiv.textContent = event.data.status;
        } else if (event.data.action === 'ocrResult') {
            if (event.data.success) {
                elements.statusDiv.textContent = STATUS_MESSAGES.CLEANING;
                const extractedText = event.data.text;
                
                // First ChatGPT call - clean the text
                elements.loader.style.display = 'block';
                document.body.classList.add('processing');
                
                // Send to sandbox for cleaning with first prompt
                document.getElementById('sandboxFrame').contentWindow.postMessage({
                    action: 'performChatGPT',
                    text: extractedText,
                    prompt: "Extract the main text from OCR-processed screenshots, removing any extraneous characters, punctuation, or irrelevant strings. Return only the cleaned, meaningful text.",
                    stage: "cleaning" // Add stage identifier
                }, '*');
                
                // Add a fallback timeout to prevent infinite loading
                window.chatgptFallbackTimeout = setTimeout(() => {
                    console.log('Fallback timeout triggered');
                    elements.statusDiv.textContent = 'Request timed out. Please try again.';
                    elements.getAnswerButton.disabled = false;
                    elements.loader.style.display = 'none';
                    document.body.classList.remove('processing');
                }, 30000); // 30 second timeout
            } else {
                elements.statusDiv.textContent = STATUS_MESSAGES.ERROR + event.data.error;
                console.error('OCR Error:', event.data.error);
                
                // Re-enable button and hide loader
                elements.getAnswerButton.disabled = false;
                elements.loader.style.display = 'none';
                document.body.classList.remove('processing');
            }
        } else if (event.data.action === 'chatgptResult') {
            // Clear any existing timeout
            if (window.chatgptFallbackTimeout) {
                clearTimeout(window.chatgptFallbackTimeout);
                window.chatgptFallbackTimeout = null;
            }
            
            if (event.data.success) {
                console.log(`ChatGPT ${event.data.stage} stage completed successfully`);
                
                if (event.data.stage === "cleaning") {
                    // First stage complete - now send for analysis
                    elements.statusDiv.textContent = STATUS_MESSAGES.ANALYZING;
                    
                    // Send to sandbox for second analysis
                    document.getElementById('sandboxFrame').contentWindow.postMessage({
                        action: 'performChatGPT',
                        text: event.data.response, // Use the cleaned text
                        prompt: "Print the answer. Do not include any other text.",
                        stage: "analyzing" // Second stage identifier
                    }, '*');
                    
                    // Add a fallback timeout for the second request
                    window.chatgptFallbackTimeout = setTimeout(() => {
                        console.log('Second stage fallback timeout triggered');
                        elements.statusDiv.textContent = 'Second request timed out. Please try again.';
                        elements.getAnswerButton.disabled = false;
                        elements.loader.style.display = 'none';
                        document.body.classList.remove('processing');
                    }, 30000); // 30 second timeout
                } else if (event.data.stage === "analyzing") {
                    // Second stage complete - display final analysis
                    elements.statusDiv.textContent = STATUS_MESSAGES.SUCCESS;
                    displayFinalAnswer(event.data.response);
                    
                    // Re-enable button and hide loader
                    elements.getAnswerButton.disabled = false;
                    elements.loader.style.display = 'none';
                    document.body.classList.remove('processing');
                } else {
                    console.warn('Unknown stage:', event.data.stage);
                    // Handle as if it was the final stage
                    elements.statusDiv.textContent = STATUS_MESSAGES.SUCCESS;
                    displayFinalAnswer(event.data.response);
                    
                    // Re-enable button and hide loader
                    elements.getAnswerButton.disabled = false;
                    elements.loader.style.display = 'none';
                    document.body.classList.remove('processing');
                }
            } else {
                elements.statusDiv.textContent = STATUS_MESSAGES.ERROR + event.data.error;
                console.error(`ChatGPT Error (${event.data.stage} stage):`, event.data.error);
                
                // Re-enable button and hide loader
                elements.getAnswerButton.disabled = false;
                elements.loader.style.display = 'none';
                document.body.classList.remove('processing');
            }
        }
    });

    // Main functionality
    async function processScreenCapture() {
        try {
            if (!sandboxReady) {
                throw new Error('Sandbox is not ready yet. Please try again in a moment.');
            }
            
            // Clear previous answer
            elements.answerDiv.innerHTML = '';
            
            // Disable button and show loader
            elements.getAnswerButton.disabled = true;
            elements.loader.style.display = 'block';
            document.body.classList.add('processing');
            elements.statusDiv.textContent = STATUS_MESSAGES.CAPTURING;
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const screenshot = await chrome.tabs.captureVisibleTab();
            
            elements.statusDiv.textContent = STATUS_MESSAGES.PROCESSING;
            
            // Send the screenshot to the sandbox for OCR processing
            elements.sandboxFrame.contentWindow.postMessage({
                action: 'performOCR',
                imageData: screenshot
            }, '*');
            
        } catch (error) {
            elements.statusDiv.textContent = STATUS_MESSAGES.ERROR + error.message;
            console.error('Error:', error);
            
            // Re-enable button and hide loader
            elements.getAnswerButton.disabled = false;
            elements.loader.style.display = 'none';
            document.body.classList.remove('processing');
        }
    }

    // Event listeners
    elements.getAnswerButton.addEventListener('click', processScreenCapture);
});

// UI Updates
function displayFinalAnswer(text) {
    const answerDiv = document.getElementById('answer');
    
    // Format the text with markdown
    const formattedText = formatMarkdown(text);
    
    // Create the answer container
    answerDiv.innerHTML = `
        <div class="answer-container">
            <div class="answer-text">${formattedText}</div>
            <button id="copyAnswer" class="copy-button">Copy Answer</button>
        </div>
    `;
    
    // Add copy functionality
    document.getElementById('copyAnswer').addEventListener('click', () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                const copyButton = document.getElementById('copyAnswer');
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Answer';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
}

// Simple markdown formatter
function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

