// ============================================================
// NOVA
// Premium Chat + Voice Assistant
// ============================================================

let questions = [];
let recognition = null;
let isListening = false;

let selectedLanguage = "auto";

let availableVoices = [];


// ============================================================
// DOM
// ============================================================

const chatContainer =
    document.getElementById("chatContainer");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const textInput =
    document.getElementById("textInput");

const sendButton =
    document.getElementById("sendButton");

const micButton =
    document.getElementById("micButton");

const stopButton =
    document.getElementById("stopButton");

const clearChatButton =
    document.getElementById("clearChatButton");

const statusText =
    document.getElementById("statusText");

const listeningIndicator =
    document.getElementById("listeningIndicator");

const languageButtons =
    document.querySelectorAll(".language-btn");


// ============================================================
// LOAD JSON
// ============================================================

async function loadQuestions() {

    try {

        const response =
            await fetch("questions.json");

        if (!response.ok) {

            throw new Error(
                "Unable to load questions.json"
            );

        }

        questions =
            await response.json();

        console.log(
            "Nova database:",
            questions.length
        );

    }

    catch (error) {

        console.error(error);

        addAssistantMessage(
            "Nova could not load her knowledge database.",
            "en"
        );

    }

}


// ============================================================
// SESSION CHAT
// ============================================================

const STORAGE_KEY =
    "nova_session_chat";


// ============================================================
// SAVE CHAT
// ============================================================

function saveChat() {

    const messages =
        Array.from(
            document.querySelectorAll(
                ".chat-message"
            )
        )
        .map(message => {

            const type =
                message.classList.contains(
                    "user"
                )
                    ? "user"
                    : "assistant";


            const bubble =
                message.querySelector(
                    ".message-bubble"
                );


            const language =
                message.classList.contains(
                    "urdu"
                )
                    ? "ur"
                    : "en";


            return {

                type,

                text:
                    bubble
                        ? bubble.textContent
                        : "",

                language

            };

        });


    sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages)
    );

}


// ============================================================
// LOAD CHAT
// ============================================================

function loadChat() {

    const saved =
        sessionStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        return;

    }


    try {

        const messages =
            JSON.parse(saved);


        messages.forEach(
            function (message) {

                if (
                    message.type ===
                    "user"
                ) {

                    addUserMessage(
                        message.text,
                        message.language,
                        false
                    );

                }

                else {

                    addAssistantMessage(
                        message.text,
                        message.language,
                        false
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Chat restore error:",
            error
        );

        sessionStorage.removeItem(
            STORAGE_KEY
        );

    }

}


// ============================================================
// ADD USER MESSAGE
// ============================================================

function addUserMessage(
    text,
    language = "en",
    save = true
) {

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chat-message user";


    if (language === "ur") {

        message.classList.add(
            "urdu"
        );

    }


    message.innerHTML = `

        <div class="message-content">

            <div class="message-name">
                You
            </div>

            <div class="message-bubble"></div>

        </div>

    `;


    message.querySelector(
        ".message-bubble"
    ).textContent =
        text;


    chatContainer.appendChild(
        message
    );


    scrollToBottom();


    if (save) {

        saveChat();

    }

}


// ============================================================
// ADD ASSISTANT MESSAGE
// ============================================================

function addAssistantMessage(
    text,
    language = "en",
    save = true
) {

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chat-message assistant";


    if (language === "ur") {

        message.classList.add(
            "urdu"
        );

    }


    message.innerHTML = `

        

        <div class="message-content">

            <div class="message-name">
                Nova
            </div>

            <div class="message-bubble"></div>

        </div>

    `;


    message.querySelector(
        ".message-bubble"
    ).textContent =
        text;


    chatContainer.appendChild(
        message
    );


    scrollToBottom();


    if (save) {

        saveChat();

    }

}


// ============================================================
// SCROLL
// ============================================================

function scrollToBottom() {

    setTimeout(
        function () {

            chatContainer.scrollTop =
                chatContainer.scrollHeight;

        },
        50
    );

}


// ============================================================
// CLEAR CHAT
// ============================================================

function clearChat() {

    const messages =
        chatContainer.querySelectorAll(
            ".chat-message"
        );


    messages.forEach(
        function (message) {

            message.remove();

        }
    );


    sessionStorage.removeItem(
        STORAGE_KEY
    );


    if (welcomeScreen) {

        welcomeScreen.style.display =
            "flex";

    }


    textInput.focus();

}


clearChatButton.addEventListener(
    "click",
    clearChat
);


// ============================================================
// VOICES
// ============================================================

function loadVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    availableVoices =
        window.speechSynthesis.getVoices();

}


if (
    "speechSynthesis" in window
) {

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
        loadVoices;

}


// ============================================================
// URDU VOICE
// ============================================================

function getUrduVoice() {

    const voices =
        availableVoices;


    if (!voices.length) {

        return null;

    }


    const femaleKeywords = [
        "female",
        "woman",
        "zira",
        "uzma",
        "sana",
        "ayesha"
    ];


    // Female Urdu

    let voice =
        voices.find(
            function (v) {

                const lang =
                    v.lang.toLowerCase();

                const name =
                    v.name.toLowerCase();


                return (

                    lang.startsWith("ur") &&

                    femaleKeywords.some(
                        keyword =>
                            name.includes(
                                keyword
                            )
                    )

                );

            }
        );


    if (voice) {

        return voice;

    }


    // Pakistani Urdu

    voice =
        voices.find(
            function (v) {

                return (
                    v.lang.toLowerCase() ===
                    "ur-pk"
                );

            }
        );


    if (voice) {

        return voice;

    }


    // Any Urdu

    return voices.find(
        function (v) {

            return v.lang
                .toLowerCase()
                .startsWith("ur");

        }
    ) || null;

}


// ============================================================
// ENGLISH VOICE
// ============================================================

function getEnglishVoice() {

    const voices =
        availableVoices;


    const femaleKeywords = [
        "female",
        "woman",
        "zira",
        "samantha",
        "susan",
        "hazel",
        "aria",
        "jenny"
    ];


    let voice =
        voices.find(
            function (v) {

                const lang =
                    v.lang.toLowerCase();

                const name =
                    v.name.toLowerCase();


                return (

                    lang.startsWith("en") &&

                    femaleKeywords.some(
                        keyword =>
                            name.includes(
                                keyword
                            )
                    )

                );

            }
        );


    if (voice) {

        return voice;

    }


    return voices.find(
        function (v) {

            return v.lang
                .toLowerCase()
                .startsWith("en");

        }
    ) || null;

}


// ============================================================
// SPEAK
// ============================================================

function speak(
    text,
    language
) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    loadVoices();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    if (
        language === "ur"
    ) {

        utterance.lang =
            "ur-PK";


        const voice =
            getUrduVoice();


        if (voice) {

            utterance.voice =
                voice;

        }

    }

    else {

        utterance.lang =
            "en-US";


        const voice =
            getEnglishVoice();


        if (voice) {

            utterance.voice =
                voice;

        }

    }


    utterance.rate =
        language === "ur"
            ? 0.85
            : 0.92;


    utterance.pitch =
        1.08;


    utterance.volume =
        1;


    utterance.onstart =
        function () {

            statusText.textContent =
                "Speaking";

        };


    utterance.onend =
        function () {

            statusText.textContent =
                "Ready";

        };


    window.speechSynthesis.speak(
        utterance
    );

}


// ============================================================
// LANGUAGE DETECTION
// ============================================================

function isUrduText(text) {

    return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/
        .test(text);

}


function detectLanguage(text) {

    return isUrduText(text)
        ? "ur"
        : "en";

}


// ============================================================
// NORMALIZE
// ============================================================

function normalizeText(text) {

    return text

        .toLowerCase()

        .trim()

        .replace(
            /[؟?!.,،؛:]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        );

}


// ============================================================
// SIMILARITY
// ============================================================

function calculateSimilarity(
    input,
    target
) {

    input =
        normalizeText(input);

    target =
        normalizeText(target);


    if (
        input === target
    ) {

        return 1;

    }


    if (
        input.includes(target) ||
        target.includes(input)
    ) {

        return 0.85;

    }


    const inputWords =
        input.split(" ");


    const targetWords =
        target.split(" ");


    let matches = 0;


    inputWords.forEach(
        function (word) {

            if (
                targetWords.includes(word)
            ) {

                matches++;

            }

        }
    );


    const total =
        Math.max(
            inputWords.length,
            targetWords.length
        );


    return total
        ? matches / total
        : 0;

}


// ============================================================
// FIND BEST QUESTION
// ============================================================

function findBestQuestion(
    question,
    language
) {

    let bestItem = null;

    let bestScore = 0;


    questions.forEach(
        function (item) {

            const target =
                language === "ur"
                    ? item.question_ur
                    : item.question_en;


            if (!target) {

                return;

            }


            const score =
                calculateSimilarity(
                    question,
                    target
                );


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                bestItem =
                    item;

            }

        }
    );


    return {

        item:
            bestItem,

        score:
            bestScore

    };

}


// ============================================================
// ANSWER
// ============================================================

function getAnswer(
    question,
    language
) {

    const result =
        findBestQuestion(
            question,
            language
        );


    if (
        !result.item ||
        result.score < 0.30
    ) {

        if (
            language === "ur"
        ) {

            return {
                text:
                    "معذرت، مجھے اس سوال کا جواب اپنے ڈیٹا بیس میں نہیں ملا۔",
                language:
                    "ur"
            };

        }


        return {
            text:
                "Sorry, I could not find an answer to that question in my database.",
            language:
                "en"
        };

    }


    if (
        language === "ur"
    ) {

        return {

            text:
                result.item.answer_ur,

            language:
                "ur"

        };

    }


    return {

        text:
            result.item.answer_en,

        language:
            "en"

    };

}


// ============================================================
// PROCESS
// ============================================================

function processQuestion(
    question
) {

    question =
        question.trim();


    if (!question) {

        return;

    }


    const language =
        detectLanguage(
            question
        );


    addUserMessage(
        question,
        language
    );


    const result =
        getAnswer(
            question,
            language
        );


    addAssistantMessage(
        result.text,
        result.language
    );


    speak(
        result.text,
        result.language
    );

}


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        5;

}


// ============================================================
// START LISTENING
// ============================================================

function startListening() {

    if (
        !recognition ||
        isListening
    ) {

        return;

    }


    if (
        selectedLanguage ===
        "en-US"
    ) {

        recognition.lang =
            "en-US";

    }

    else {

        /*
            Urdu is default because
            Nova is designed for Urdu.
        */

        recognition.lang =
            "ur-PK";

    }


    try {

        recognition.start();

        isListening =
            true;

        micButton.classList.add(
            "listening"
        );

        listeningIndicator.classList.add(
            "active"
        );

        statusText.textContent =
            "Listening";

    }

    catch (error) {

        console.error(error);

    }

}


// ============================================================
// STOP
// ============================================================

function stopListening() {

    if (!recognition) {

        return;

    }


    try {

        recognition.stop();

    }

    catch (error) {

        console.log(error);

    }


    resetListening();

}


// ============================================================
// RESET LISTENING
// ============================================================

function resetListening() {

    isListening =
        false;


    micButton.classList.remove(
        "listening"
    );


    listeningIndicator.classList.remove(
        "active"
    );


    statusText.textContent =
        "Ready";

}


// ============================================================
// RECOGNITION RESULT
// ============================================================

if (recognition) {

    recognition.onresult =
        function (event) {

            const result =
                event.results[
                    event.results.length - 1
                ];


            const transcript =
                result[0]
                    .transcript
                    .trim();


            console.log(
                "Nova heard:",
                transcript
            );


            processQuestion(
                transcript
            );

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Recognition error:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                addAssistantMessage(
                    "Please allow microphone access for Nova.",
                    "en"
                );

            }

            else if (
                event.error ===
                "no-speech"
            ) {

                addAssistantMessage(
                    "Nova didn't hear anything. Please try again.",
                    "en"
                );

            }


            resetListening();

        };


    recognition.onend =
        function () {

            resetListening();

        };

}


// ============================================================
// BUTTON EVENTS
// ============================================================

micButton.addEventListener(
    "click",
    startListening
);


stopButton.addEventListener(
    "click",
    stopListening
);


sendButton.addEventListener(
    "click",
    function () {

        processQuestion(
            textInput.value
        );


        textInput.value =
            "";


        textInput.focus();

    }
);


// ============================================================
// ENTER KEY
// ============================================================

textInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            sendButton.click();

        }

    }
);


// ============================================================
// LANGUAGE BUTTONS
// ============================================================

languageButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                languageButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                this.classList.add(
                    "active"
                );


                selectedLanguage =
                    this.dataset.language;

            }
        );

    }
);


// ============================================================
// INITIALIZE
// ============================================================

loadQuestions();

loadChat();

textInput.focus();