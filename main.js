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
                // Update the transcript display in real-time
                document.getElementById('transcript').innerHTML = 'Transcript: ' + transcript;
            }
        }
    };
    
    recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        // Hide recording indicator when error occurs
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('status').textContent = 'Error: ' + event.error;
    };
    
    return recognitionInstance;
}

document.getElementById('startListening').addEventListener('click', () => {
    //start listening to voice
    if (!recognition) {
        recognition = setupSpeechRecognition();
        if (!recognition) return; // Exit if speech recognition isn't supported
    }
    
    // Clear previous transcript
    transcript = '';
    document.getElementById('transcript').innerHTML = 'Transcript: ';
    
    // Show recording indicator
    document.querySelector('.loader-container').style.display = 'flex';
    document.getElementById('status').textContent = 'Recording...';
    
    // Start recognition
    try {
        recognition.start();
        console.log('Speech recognition started');
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        // Hide recording indicator if start fails
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('status').textContent = 'Error starting recording';
    }
    
    console.log('Start listening button clicked');
});

document.getElementById('stopListening').addEventListener('click', () => {
    //stop listening to voice
    if (recognition) {
        recognition.stop();
        console.log('Speech recognition stopped');
        console.log('Final transcript:', transcript);
        
        // Hide recording indicator
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('status').textContent = 'Ready to listen';
        
        //display the transcript in the element in the html with id = "transcript"
        document.getElementById('transcript').innerHTML = 'Transcript: ' + transcript;
        // Here you would send the transcript to your API
        // sendToAPI(transcript);
    }
    
    //stop the temp file
    //send the temp file to the ChatGPT API
    //get the response
    //display the response
    console.log('Stop listening button clicked');
});
