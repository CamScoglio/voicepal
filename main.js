//import API keys
let recognition;
let transcript = '';
let transcriptHistory = [];
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentAudio = null;

// Debug function to check if elements exist
function checkElements() {
    console.log('Checking elements:');
    console.log('transcript-history exists:', !!document.getElementById('transcript-history'));
    console.log('transcript exists:', !!document.getElementById('transcript'));
    console.log('toggleRecording exists:', !!document.getElementById('toggleRecording'));
    console.log('Current history length:', transcriptHistory.length);
}

// Call this immediately
window.onload = function() {
    checkElements();
    console.log('Page loaded');
    
    // Force display of any existing history
    if (transcriptHistory.length > 0) {
        console.log('Displaying existing history on load');
        updateTranscriptHistory();
    }
};

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
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                transcript += result[0].transcript + ' ';
                console.log('Final transcript part:', result[0].transcript);
            } else {
                interimTranscript += result[0].transcript;
            }
        }
        
        // Update the transcript display in real-time
        document.getElementById('transcript').innerHTML = 'Transcript: ' + transcript + 
            (interimTranscript ? '<i style="color: #999"> ' + interimTranscript + '</i>' : '');
        
        console.log('Current transcript:', transcript);
    };
    
    recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        // Hide recording indicator when error occurs
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('status').textContent = 'Error: ' + event.error;
        
        // Reset recording state
        isRecording = false;
        updateRecordButton();
    };
    
    recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        
        // If we're still in recording state, restart recognition
        // This helps with the 60-second limit in some browsers
        if (isRecording) {
            try {
                recognitionInstance.start();
                console.log('Restarted speech recognition');
            } catch (error) {
                console.error('Error restarting speech recognition:', error);
                isRecording = false;
                updateRecordButton();
            }
        }
    };
    
    return recognitionInstance;
}

// Setup audio recording
async function setupAudioRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('Audio recording completed, size:', audioBlob.size);
            
            // Get the transcript we stored before stopping
            const savedTranscript = mediaRecorder._finalTranscript;
            
            // Save the audio URL with the transcript
            if (savedTranscript && savedTranscript.trim() !== '') {
                // Get current date and time
                const now = new Date();
                const dateTimeStr = now.toLocaleString();
                
                // Save transcript with timestamp and audio to history
                const newEntry = {
                    text: savedTranscript,
                    timestamp: dateTimeStr,
                    audioUrl: audioUrl,
                    audioBlob: audioBlob
                };
                
                transcriptHistory.push(newEntry);
                
                console.log('Added to history with audio. New length:', transcriptHistory.length);
                
                // Update the transcript history display
                updateTranscriptHistory();
            } else {
                console.log('No transcript to save with audio');
            }
        };
        
        return true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access your microphone. Please check permissions and try again.');
        return false;
    }
}

// Function to toggle recording state
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    // Setup speech recognition
    if (!recognition) {
        recognition = setupSpeechRecognition();
        if (!recognition) return; // Exit if speech recognition isn't supported
    }
    
    // Setup audio recording
    if (!mediaRecorder) {
        const success = await setupAudioRecording();
        if (!success) return; // Exit if audio recording setup failed
    }
    
    // Clear current transcript (but keep history)
    transcript = '';
    document.getElementById('transcript').innerHTML = 'Transcript: ';
    
    // Show recording indicator
    document.querySelector('.loader-container').style.display = 'flex';
    document.getElementById('status').textContent = 'Recording...';
    
    // Reset audio chunks for new recording
    audioChunks = [];
    
    // Start recognition and recording
    try {
        recognition.start();
        mediaRecorder.start();
        console.log('Speech recognition and audio recording started');
        isRecording = true;
        updateRecordButton();
    } catch (error) {
        console.error('Error starting recording:', error);
        // Hide recording indicator if start fails
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('status').textContent = 'Error starting recording';
        isRecording = false;
        updateRecordButton();
    }
    
    console.log('Recording started');
}

function stopRecording() {
    // Stop speech recognition
    if (recognition) {
        recognition.stop();
        console.log('Speech recognition stopped');
    }
    
    // Store the final transcript before stopping audio recording
    const finalTranscript = transcript;
    console.log('Final transcript:', finalTranscript);
    
    // Only proceed if we have a non-empty transcript
    if (finalTranscript && finalTranscript.trim() !== '') {
        // Stop audio recording - the saving will happen in the onstop event
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            // We'll use the stored transcript in the onstop handler
            mediaRecorder._finalTranscript = finalTranscript;
            mediaRecorder.stop();
            console.log('Audio recording stopped with transcript');
        } else {
            console.warn('MediaRecorder not active, saving transcript without audio');
            // Save transcript without audio
            const now = new Date();
            const dateTimeStr = now.toLocaleString();
            
            transcriptHistory.push({
                text: finalTranscript,
                timestamp: dateTimeStr
            });
            
            console.log('Added to history without audio. New length:', transcriptHistory.length);
            updateTranscriptHistory();
        }
    } else {
        console.log('Empty transcript, not saving');
        // Still stop the recorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            console.log('Audio recording stopped (empty transcript)');
        }
    }
    
    // Hide recording indicator
    document.querySelector('.loader-container').style.display = 'none';
    document.getElementById('status').textContent = 'Ready to record';
    
    isRecording = false;
    updateRecordButton();
    
    console.log('Recording stopped');
}

function updateRecordButton() {
    const recordButton = document.getElementById('toggleRecording');
    if (recordButton) {
        if (isRecording) {
            recordButton.textContent = 'Stop Recording';
            recordButton.classList.add('recording');
        } else {
            recordButton.textContent = 'Start Recording';
            recordButton.classList.remove('recording');
        }
    } else {
        console.error('Record button not found!');
    }
}

function playAudio(audioUrl, buttonElement) {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        
        // Reset all play buttons
        document.querySelectorAll('.play-button').forEach(btn => {
            btn.textContent = '▶️ Play';
            btn.classList.remove('playing');
        });
    }
    
    // If the same button was clicked, just stop playback
    if (buttonElement.classList.contains('playing')) {
        return;
    }
    
    // Create and play new audio
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    
    // Update button state
    buttonElement.textContent = '⏸️ Pause';
    buttonElement.classList.add('playing');
    
    // Play the audio
    audio.play();
    
    // When audio ends, reset the button
    audio.onended = () => {
        buttonElement.textContent = '▶️ Play';
        buttonElement.classList.remove('playing');
        currentAudio = null;
    };
    
    // Handle pause event
    audio.onpause = () => {
        buttonElement.textContent = '▶️ Play';
        buttonElement.classList.remove('playing');
    };
}

function updateTranscriptHistory() {
    console.log('updateTranscriptHistory called');
    const historyContainer = document.getElementById('transcript-history');
    
    if (!historyContainer) {
        console.error('CRITICAL ERROR: transcript-history element not found!');
        alert('Could not find transcript history container');
        return;
    }
    
    console.log('Updating transcript history, count:', transcriptHistory.length);
    
    // Clear current history display
    historyContainer.innerHTML = '';
    
    if (transcriptHistory.length === 0) {
        historyContainer.innerHTML = '<p>No transcripts recorded yet.</p>';
        return;
    }
    
    // Add each transcript to the history container (newest first)
    transcriptHistory.slice().reverse().forEach((entry, index) => {
        console.log(`Creating card ${index} for entry:`, entry);
        
        const transcriptCard = document.createElement('div');
        transcriptCard.className = 'transcript-card';
        
        const timestampElement = document.createElement('div');
        timestampElement.className = 'timestamp';
        timestampElement.textContent = entry.timestamp;
        
        const textElement = document.createElement('div');
        textElement.className = 'transcript-text';
        textElement.textContent = entry.text;
        
        transcriptCard.appendChild(timestampElement);
        transcriptCard.appendChild(textElement);
        
        // Add audio playback if available
        if (entry.audioUrl) {
            const audioControls = document.createElement('div');
            audioControls.className = 'audio-controls';
            
            const playButton = document.createElement('button');
            playButton.className = 'play-button';
            playButton.textContent = '▶️ Play';
            playButton.addEventListener('click', function() {
                playAudio(entry.audioUrl, this);
            });
            
            audioControls.appendChild(playButton);
            transcriptCard.appendChild(audioControls);
        }
        
        historyContainer.appendChild(transcriptCard);
        console.log('Added transcript card to DOM');
    });
}

// Set up the toggle button event listener when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the toggle button
    const toggleButton = document.getElementById('toggleRecording');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleRecording);
        console.log('Toggle button event listener added');
    } else {
        console.error('Toggle button not found!');
    }
    
    // Initialize button state
    updateRecordButton();
    
    // Request microphone permission early
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            console.log('Microphone permission granted');
            stream.getTracks().forEach(track => track.stop()); // Stop the stream
        })
        .catch(error => {
            console.error('Microphone permission denied:', error);
        });
});
