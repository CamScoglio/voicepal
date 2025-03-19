//import API keys
let recognition;
let transcript = '';

function setupSpeechRecognition() {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
        return null;
    }
    
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US'; // Set language
    
    // Set up event handlers
    recognitionInstance.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript + ' ';
                console.log('Transcript so far:', transcript);
            }
        }
    };
    
    recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
    
    return recognitionInstance;
}

onEvent('startListening',"click", () => {
    //start listening to voice
    if (!recognition) {
        recognition = setupSpeechRecognition();
        if (!recognition) return; // Exit if speech recognition isn't supported
    }
    
    // Clear previous transcript
    transcript = '';
    
    // Start recognition
    try {
        recognition.start();
        console.log('Speech recognition started');
    } catch (error) {
        console.error('Error starting speech recognition:', error);
    }
    
    console.log('Start listening button clicked');
});

onEvent('stopListening', "click", () => {
    //stop listening to voice
    if (recognition) {
        recognition.stop();
        console.log('Speech recognition stopped');
        console.log('Final transcript:', transcript);
        
        // Here you would send the transcript to your API
        // sendToAPI(transcript);
    }
    
    //stop the temp file
    //send the temp file to the ChatGPT API
    //get the response
    //display the response
    console.log('Stop listening button clicked');
});
