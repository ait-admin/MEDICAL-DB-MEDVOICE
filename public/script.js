// Language mapping with Hindi voice for most Indian languages
const LANGUAGES = {
    "English": "en", "Hindi": "hi", "Kannada": "kn", "Marathi": "mr", "Tamil": "ta",
    "Telugu": "te", "Spanish": "es", "French": "fr", "Arabic": "ar",
    "Bengali": "bn", "Chinese": "zh", "German": "de", "Japanese": "ja",
    "Portuguese": "pt", "Russian": "ru", "Urdu": "ur", "Punjabi": "pa",
    "Gujarati": "gu", "Malayalam": "ml", "Odia": "or", "Italian": "it",
    "Dutch": "nl", "Korean": "ko", "Turkish": "tr", "Vietnamese": "vi", 
    "Thai": "th", "Haryanvi": "hi" 
};

// Preload voices
if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = function() {
        console.log("Voices loaded:", speechSynthesis.getVoices());
    };
    speechSynthesis.getVoices(); // Triggers loading
}

// Check speech synthesis support
function isSpeechSupported() {
    return 'speechSynthesis' in window && window.speechSynthesis !== undefined;
}

// Conversation history
let conversationHistory = [];
let isPlayingBack = false;
let currentPlaybackIndex = 0;

// ChatGPT API Configuration
const CHATGPT_API_KEY = 'YOUR_API_KEY_HERE';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';
const CHATGPT_MODEL = 'gpt-3.5-turbo';

document.addEventListener('DOMContentLoaded', () => {
    const doctorBtn = document.getElementById('doctor-btn');
    const patientBtn = document.getElementById('patient-btn');
    const clearBtn = document.getElementById('clear-btn');
    const doctorLang = document.getElementById('doctor-lang-input');
    const patientLang = document.getElementById('patient-lang-input');
    const latestMessageContainer = document.getElementById('latest-message-container');
    const conversationHistoryContainer = document.getElementById('conversation-history');

    // Add event listener for New Meet button
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleNewMeeting();
        });
    }
    // Populate language dropdowns
    function populateLanguageDropdowns() {
        const dropdowns = [doctorLang, patientLang];
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            
            const indianGroup = document.createElement('optgroup');
            indianGroup.label = "Indian Languages";
            dropdown.appendChild(indianGroup);
            
            const otherGroup = document.createElement('optgroup');
            otherGroup.label = "Other Languages";
            dropdown.appendChild(otherGroup);
            
            Object.keys(LANGUAGES).forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = lang;
                
                if (["English", "Spanish", "French", "Arabic", "Russian", "Chinese"].includes(lang)) {
                    otherGroup.appendChild(option);
                } else {
                    indianGroup.appendChild(option);
                }
            });
        });
        
        doctorLang.value = "English";
        patientLang.value = "Hindi";
    }

    // Check browser support
    if (!('webkitSpeechRecognition' in window)) {
        if (doctorBtn) doctorBtn.disabled = true;
        if (patientBtn) patientBtn.disabled = true;
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
    }

    // Initialize speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Helper functions
    function flashStatus(button, originalLabel) {
        if (!button) return;
        const labelSpan = button.querySelector('.btn-label') || button;
        labelSpan.textContent = "Listening...";
        button.disabled = true;
        
        setTimeout(() => {
            labelSpan.textContent = "Recognizing...";
        }, 2000);
    }

    function resetButton(button, originalLabel) {
        if (!button) return;
        const labelSpan = button.querySelector('.btn-label') || button;
        labelSpan.textContent = originalLabel;
        button.disabled = false;
    }

    function addMessageToHistory(speaker, originalText, translatedText) {
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/,/g, '');

        const message = {
            timestamp: `[${timestamp}]`,
            speaker: speaker.toLowerCase(),
            original: originalText,
            translated: translatedText,
            doctorLang: doctorLang.value,
            patientLang: patientLang.value
        };

        conversationHistory.push(message);
        updateConversationHistoryUI();
    }

    function updateConversationHistoryUI() {
        if (!conversationHistoryContainer) return;
        
        if (conversationHistory.length === 0) {
            conversationHistoryContainer.innerHTML = '<p><em>No history yet.</em></p>';
            return;
        }

        let html = '';
        conversationHistory.forEach((entry, index) => {
            const langUsed = entry.speaker === 'doctor' ? entry.patientLang : entry.doctorLang;
            const isActive = isPlayingBack && currentPlaybackIndex === index;
            const isDoctor = entry.speaker === 'doctor';
            html += `
                <article class="chat-message ${entry.speaker} ${isActive ? 'active-playback' : ''} animate-message" aria-label="${entry.speaker} message" data-index="${index}" style="display: flex; flex-direction: row; justify-content: ${isDoctor ? 'flex-start' : 'flex-end'};">
                    ${isDoctor
                        ? `<img src="image/doctor.jpg" class="avatar chat-avatar" alt="doctor Avatar" />`
                        : ''}
                    <div class="message-bubble">
                        <strong>${entry.original}</strong><br>
                        <em>Translated to ${langUsed}: ${entry.translated}</em>
                        <div class="timestamp">${entry.timestamp}</div>
                    </div>
                    ${!isDoctor
                        ? `<img src="image/patient.jpg" class="avatar chat-avatar" alt="patient Avatar" />`
                        : ''}
                </article>
            `;
        });

        conversationHistoryContainer.innerHTML = html;
        setTimeout(() => {
            const messages = conversationHistoryContainer.querySelectorAll('.animate-message');
            messages.forEach((msg, i) => {
                setTimeout(() => {
                    msg.classList.add('show-message');
                }, 60 * i);
            });
        }, 10);
        conversationHistoryContainer.scrollTop = conversationHistoryContainer.scrollHeight;
    }

    function updateLatestMessage(speaker, originalText, translatedText, targetLangName) {
        if (!latestMessageContainer) return;
        
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/,/g, '');

        const isDoctor = speaker.toLowerCase() === 'doctor';
        latestMessageContainer.innerHTML = `
            <article class="chat-message ${speaker.toLowerCase()} animate-message show-message" aria-label="${speaker} message" style="display: flex; flex-direction: row; justify-content: ${isDoctor ? 'flex-start' : 'flex-end'};">
                ${isDoctor
                    ? `<img src="image/doctor.jpg" class="avatar chat-avatar" alt="doctor Avatar" />`
                    : ''}
                <div class="message-bubble">
                    <strong>${originalText}</strong><br>
                    <em>Translated to ${targetLangName} by ${speaker}: ${translatedText}
                        <button class="btn btn-link btn-sm speak-btn" title="Play translation" style="padding:0 0.25rem;vertical-align:middle;" data-lang="${targetLangName}" data-text="${encodeURIComponent(translatedText)}">
                            <i class="bi bi-volume-up-fill"></i>
                        </button>
                    </em>
                    <div class="timestamp">[${timestamp}]</div>
                </div>
                ${!isDoctor
                    ? `<img src="image/patient.jpg" class="avatar chat-avatar" alt="patient Avatar" />`
                    : ''}
            </article>
        `;
        
        const speakBtn = latestMessageContainer.querySelector('.speak-btn');
        if (speakBtn) {
            speakBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const langName = this.getAttribute('data-lang');
                const text = decodeURIComponent(this.getAttribute('data-text'));
                const langCode = langName === "Haryanvi" ? "hi" : LANGUAGES[langName] || 'en';
                textToSpeech(text, langCode, langName);
            });
        }
    }

    // ChatGPT Translation Function
    async function translateWithChatGPT(text, targetLang, sourceLangName) {
        const isHaryanvi = sourceLangName === "Haryanvi" || targetLang === "Haryanvi";
        const actualTargetLang = targetLang === "Haryanvi" ? "Hindi" : targetLang;
        const actualSourceLang = sourceLangName === "Haryanvi" ? "Hindi" : sourceLangName;
        
        try {
            const response = await fetch(CHATGPT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CHATGPT_API_KEY}`
                },
                body: JSON.stringify({
                    model: CHATGPT_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `You are a professional medical translator. Translate the following text from ${actualSourceLang} to ${actualTargetLang} while maintaining the medical context and being culturally appropriate. Keep the translation accurate and natural.`
                        },
                        {
                            role: "user",
                            content: text
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            let translatedText = data.choices[0]?.message?.content?.trim();
            
            if (!translatedText) {
                throw new Error("No translation returned from API");
            }

            if (targetLang === "Haryanvi") {
                const haryanviResponse = await fetch(CHATGPT_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${CHATGPT_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: CHATGPT_MODEL,
                        messages: [
                            {
                                role: "system",
                                content: `Convert the following Hindi paragraph into respectful Haryanvi dialect by:Starting with "राम राम सा" as greeting.Using "सै" or "से" instead of "है/हूँ/हैं".Replacing आप → तै, मैं → मैं, हूँ → सै respectfully.Keeping tone polite, rural, and culturally accurate.Use soft, local vocabulary as spoken by respectful Haryanvi speakers.`
                            },
                            {
                                role: "user",
                                content: translatedText
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 1000
                    })
                });

                if (haryanviResponse.ok) {
                    const haryanviData = await haryanviResponse.json();
                    translatedText = haryanviData.choices[0]?.message?.content?.trim() || translatedText;
                }
            }

            return translatedText;
        } catch (error) {
            console.error("ChatGPT translation error:", error);
            throw error;
        }
    }

    // Main translation function
    async function translateText(text, targetLang, sourceLangName) {
        try {
            return await translateWithChatGPT(text, targetLang, sourceLangName);
        } catch (error) {
            console.error("Translation failed:", error);
            return "Translation unavailable";
        }
    }

    // Text-to-Speech Function
    function textToSpeech(text, langCode, langName) {
        return new Promise((resolve) => {
            if (speechSynthesis.getVoices().length === 0) {
                speechSynthesis.onvoiceschanged = function() {
                    speechSynthesis.onvoiceschanged = null;
                    doTextToSpeech(text, langCode, langName, resolve);
                };
                speechSynthesis.getVoices();
                return;
            }
            doTextToSpeech(text, langCode, langName, resolve);
        });
    }

    function doTextToSpeech(text, langCode, langName, resolve) {
        if (!isSpeechSupported()) {
            console.warn("Speech synthesis not supported");
            resolve();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        const langMap = {
            'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'ta': 'ta-IN', 
            'kn': 'kn-IN', 'ml': 'ml-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 
            'pa': 'pa-IN', 'or': 'or-IN', 'ur': 'ur-PK',
            'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'ar': 'ar-SA', 
            'zh': 'zh-CN', 'de': 'de-DE', 'ja': 'ja-JP', 'pt': 'pt-PT', 
            'ru': 'ru-RU', 'it': 'it-IT', 'nl': 'nl-NL', 'ko': 'ko-KR', 
            'tr': 'tr-TR', 'vi': 'vi-VN', 'th': 'th-TH'
        };
        
        utterance.lang = langMap[langCode] || langCode;
        
        const availableVoices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        selectedVoice = availableVoices.find(voice => 
            voice.lang.toLowerCase() === utterance.lang.toLowerCase()
        );
        
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(voice => 
                voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
            );
        }
        
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(voice => 
                voice.lang.toLowerCase().includes(langCode.toLowerCase())
            );
        }
        
        if (!selectedVoice && ['bn','te','ta','kn','ml','mr','gu','pa','or'].includes(langCode)) {
            selectedVoice = availableVoices.find(voice => 
                voice.lang.toLowerCase().includes('hi-in')
            );
        }
        
        if (!selectedVoice) {
            selectedVoice = availableVoices.find(voice => 
                voice.default
            ) || availableVoices[0];
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`Using voice: ${selectedVoice.name} for ${langName} (${utterance.lang})`);
        } else {
            console.warn(`No suitable voice found for ${langName} (${langCode})`);
        }
        
        utterance.onerror = (event) => {
            console.error("SpeechSynthesis error:", event);
            resolve();
        };
        
        utterance.onend = () => {
            resolve();
        };
        
        speechSynthesis.speak(utterance);
    }

    async function handleSpeech(speaker) {
        const targetLangName = speaker === 'Doctor' ? patientLang.value : doctorLang.value;
        const sourceLangName = speaker === 'Doctor' ? doctorLang.value : patientLang.value;
        const sourceLangCode = sourceLangName === "Haryanvi" ? "hi" : LANGUAGES[sourceLangName] || 'en';
        
        flashStatus(speaker === 'Doctor' ? doctorBtn : patientBtn, 
                  speaker === 'Doctor' ? 'Doctor Speaking' : 'Patient Speaking');

        try {
            recognition.lang = sourceLangCode;
            recognition.start();

            const recognitionResult = await new Promise((resolve, reject) => {
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    resolve(transcript);
                };

                recognition.onerror = (event) => {
                    if (event.error === 'no-speech') {
                        alert('No speech was detected. Please try again.');
                    }
                    reject(event.error);
                };
            });

            if (!recognitionResult.trim()) {
                throw new Error("No speech detected");
            }

            const translatedText = await translateText(recognitionResult, targetLangName, sourceLangName);
            updateLatestMessage(speaker, recognitionResult, translatedText, targetLangName);
            addMessageToHistory(speaker, recognitionResult, translatedText);

            const langCode = targetLangName === "Haryanvi" ? "hi" : LANGUAGES[targetLangName] || 'en';
            await textToSpeech(translatedText, langCode, targetLangName);

        } catch (error) {
            console.error("Error:", error);
            updateLatestMessage(speaker, "Error processing speech", error.message, targetLangName);
        } finally {
            resetButton(speaker === 'Doctor' ? doctorBtn : patientBtn, 
                      speaker === 'Doctor' ? 'Doctor Speaking' : 'Patient Speaking');
        }
    }

    function clearConversation() {
        conversationHistory = [];
        updateConversationHistoryUI();
        if (latestMessageContainer) {
            latestMessageContainer.innerHTML = '<p><em>Not yet started.</em></p>';
        }
    }

    function downloadConversation() {
        if (conversationHistory.length === 0) {
            alert("No conversation to download");
            return;
        }

        let content = "Doctor-Patient Conversation Transcript\n\n";
        content += `Doctor's Language: ${doctorLang.value}\n`;
        content += `Patient's Language: ${patientLang.value}\n\n`;
        
        conversationHistory.forEach(entry => {
            const direction = entry.speaker === 'doctor' ? 
                `(Doctor in ${entry.doctorLang} → Patient in ${entry.patientLang})` :
                `(Patient in ${entry.patientLang} → Doctor in ${entry.doctorLang})`;
            
            content += `${entry.timestamp} ${entry.speaker}: ${entry.original}\n`;
            content += `Translated ${direction}: ${entry.translated}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conversation_transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleNewMeeting() {
        if (conversationHistory.length > 0) {
            const shouldDownload = confirm("Would you like to download the current conversation before starting a new meeting?");
            if (shouldDownload) {
                downloadConversation();
            }
        }
        clearConversation();
    }

    // Initialize the app
    populateLanguageDropdowns();

    // Event listeners
    if (doctorBtn) doctorBtn.addEventListener('click', () => handleSpeech('Doctor'));
    if (patientBtn) patientBtn.addEventListener('click', () => handleSpeech('Patient'));
    if (newMeetingBtn) newMeetingBtn.addEventListener('click', handleNewMeeting);
});

// Styles
const style = document.createElement('style');
style.innerHTML = `
  .chat-avatar {
    width: 38px !important;
    height: 38px !important;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(78,84,200,0.13);
    margin-right: 12px;
    transition: transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1), filter 0.18s cubic-bezier(.4,0,.2,1);
    cursor: pointer;
    animation: avatar-pop 0.6s cubic-bezier(.4,0,.2,1);
  }
  .chat-avatar:hover {
    transform: scale(1.18) translateY(-4px) rotate(-8deg);
    box-shadow: 0 6px 24px rgba(78,84,200,0.22);
    filter: brightness(1.08) drop-shadow(0 0 8px #b5ead7);
    z-index: 2;
    animation: avatar-bounce 0.5s cubic-bezier(.4,0,.2,1);
  }
  @keyframes avatar-pop {
    0% { transform: scale(0.7) rotate(-10deg); opacity: 0; }
    60% { transform: scale(1.15) rotate(6deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes avatar-bounce {
    0% { transform: scale(1.18) translateY(-4px) rotate(-8deg); }
    40% { transform: scale(1.28) translateY(-10px) rotate(-12deg); }
    100% { transform: scale(1.18) translateY(-4px) rotate(-8deg); }
  }
  .chat-message.animate-message {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
    transition: opacity 0.38s cubic-bezier(.4,0,.2,1), transform 0.38s cubic-bezier(.4,0,.2,1);
  }
  .chat-message.show-message {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .message-bubble {
    background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%);
    border-radius: 12px;
    padding: 0.7em 1.2em;
    margin-bottom: 0.2em;
    box-shadow: 0 2px 8px rgba(78,84,200,0.08);
    position: relative;
    animation: bubble-pop 0.5s cubic-bezier(.4,0,.2,1);
  }
  .chat-message.doctor .message-bubble {
    background: linear-gradient(90deg, #f7cac9 0%, #92a8d1 100%);
    align-self: flex-start;
    margin-left: 0.2em;
    margin-right: auto;
  }
  .chat-message.patient .message-bubble {
    background: linear-gradient(90deg, #b5ead7 0%, #ffdac1 100%);
    align-self: flex-end;
    margin-right: 0.2em;
    margin-left: auto;
  }
  @keyframes bubble-pop {
    0% { transform: scale(0.85); opacity: 0; }
    60% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(style);