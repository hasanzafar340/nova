// ============================================================
// NOVA VOICE ASSISTANT
// Urdu + English
// JSON Based Knowledge
// Pure JavaScript
// ============================================================


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let questions = [];

let recognition = null;

let isListening = false;

let selectedLanguage = "auto";

let availableVoices = [];


// ============================================================
// DOM ELEMENTS
// ============================================================

const micButton =
    document.getElementById("micButton");

const micButtonText =
    document.getElementById("micButtonText");

const stopButton =
    document.getElementById("stopButton");

const userText =
    document.getElementById("userText");

const assistantText =
    document.getElementById("assistantText");

const assistantCircle =
    document.getElementById("assistantCircle");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");

const textInput =
    document.getElementById("textInput");

const sendButton =
    document.getElementById("sendButton");

const languageButtons =
    document.querySelectorAll(".language-btn");


// ============================================================
// LOAD QUESTIONS.JSON
// ============================================================

async function loadQuestions() {

    try {

        const response =
            await fetch("questions.json");

        if (!response.ok) {

            throw new Error(
                "questions.json could not be loaded"
            );

        }

        questions =
            await response.json();

        console.log(
            "Nova knowledge base loaded:",
            questions.length,
            "entries"
        );

    }

    catch (error) {

        console.error(
            "JSON ERROR:",
            error
        );

        assistantText.textContent =
            "Nova could not load her knowledge database.";

    }

}


// ============================================================
// SPEECH SYNTHESIS
// ============================================================

function loadVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        console.error(
            "Speech synthesis is not supported."
        );

        return;

    }


    availableVoices =
        window.speechSynthesis.getVoices();


    console.log(
        "Available voices:",
        availableVoices
    );


    availableVoices.forEach(
        function (voice) {

            console.log(
                voice.name,
                "|",
                voice.lang
            );

        }
    );

}


// Chrome sometimes loads voices asynchronously.

if (
    "speechSynthesis" in window
) {

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
        function () {

            loadVoices();

        };

}


// ============================================================
// CHECK WHETHER TEXT IS URDU
// ============================================================

function isUrduText(text) {

    /*
        Urdu uses Arabic/Persian Unicode characters.

        Example:

        آپ کا نام کیا ہے؟

        This function returns TRUE.

        Roman Urdu:

        Aap ka naam kya hai?

        This returns FALSE.
    */


    const urduPattern =
        /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;


    return urduPattern.test(text);

}


// ============================================================
// DETECT LANGUAGE
// ============================================================

function detectLanguage(text) {

    if (
        isUrduText(text)
    ) {

        return "ur";

    }


    return "en";

}


// ============================================================
// FIND URDU VOICE
// ============================================================

function findUrduVoice() {

    if (
        availableVoices.length === 0
    ) {

        return null;

    }


    /*
        Priority:

        1. Pakistani Urdu
        2. Any Urdu voice
        3. Voice containing Urdu in name
    */


    // --------------------------------------------------------
    // 1. Pakistani Urdu
    // --------------------------------------------------------

    let voice =
        availableVoices.find(
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


    // --------------------------------------------------------
    // 2. Any Urdu voice
    // --------------------------------------------------------

    voice =
        availableVoices.find(
            function (v) {

                return v.lang
                    .toLowerCase()
                    .startsWith("ur");

            }
        );


    if (voice) {

        return voice;

    }


    // --------------------------------------------------------
    // 3. Search voice name
    // --------------------------------------------------------

    voice =
        availableVoices.find(
            function (v) {

                return v.name
                    .toLowerCase()
                    .includes("urdu");

            }
        );


    return voice || null;

}


// ============================================================
// FIND FEMALE URDU VOICE
// ============================================================

function findFemaleUrduVoice() {

    if (
        availableVoices.length === 0
    ) {

        return null;

    }


    const femaleNames = [

        "female",

        "woman",

        "girl",

        "zira",

        "sara",

        "sana",

        "ayesha",

        "heera",

        "uzma",

        "aria"

    ];


    // --------------------------------------------------------
    // Search Urdu + female name
    // --------------------------------------------------------

    let voice =
        availableVoices.find(
            function (v) {

                const lang =
                    v.lang.toLowerCase();

                const name =
                    v.name.toLowerCase();


                return (

                    lang.startsWith("ur") &&

                    femaleNames.some(
                        function (keyword) {

                            return name.includes(
                                keyword
                            );

                        }
                    )

                );

            }
        );


    if (voice) {

        return voice;

    }


    // --------------------------------------------------------
    // If no female Urdu voice,
    // use any Urdu voice.
    // --------------------------------------------------------

    return findUrduVoice();

}


// ============================================================
// FIND FEMALE ENGLISH VOICE
// ============================================================

function findFemaleEnglishVoice() {

    if (
        availableVoices.length === 0
    ) {

        return null;

    }


    const femaleNames = [

        "female",

        "woman",

        "girl",

        "zira",

        "samantha",

        "susan",

        "hazel",

        "aria",

        "jenny",

        "libby"

    ];


    let voice =
        availableVoices.find(
            function (v) {

                const lang =
                    v.lang.toLowerCase();

                const name =
                    v.name.toLowerCase();


                return (

                    lang.startsWith("en") &&

                    femaleNames.some(
                        function (keyword) {

                            return name.includes(
                                keyword
                            );

                        }
                    )

                );

            }
        );


    if (voice) {

        return voice;

    }


    // Fallback

    return availableVoices.find(
        function (v) {

            return v.lang
                .toLowerCase()
                .startsWith("en");

        }
    ) || null;

}


// ============================================================
// SELECT NOVA VOICE
// ============================================================

function getNovaVoice(language) {

    if (
        language === "ur"
    ) {

        return findFemaleUrduVoice();

    }


    return findFemaleEnglishVoice();

}


// ============================================================
// SPEAK TEXT
// ============================================================

function speak(text, language) {

    if (
        !("speechSynthesis" in window)
    ) {

        console.error(
            "Speech synthesis is not available."
        );

        return;

    }


    // Stop previous speech.

    window.speechSynthesis.cancel();


    /*
        Sometimes Chrome doesn't return voices
        immediately.

        Try loading them again.
    */

    loadVoices();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    // ========================================================
    // URDU
    // ========================================================

    if (
        language === "ur"
    ) {

        utterance.lang =
            "ur-PK";


        const urduVoice =
            findFemaleUrduVoice();


        if (urduVoice) {

            utterance.voice =
                urduVoice;


            console.log(
                "Nova Urdu voice:",
                urduVoice.name,
                urduVoice.lang
            );

        }

        else {

            /*
                No Urdu voice installed.

                The text is still Urdu,
                but browser may use its
                default voice.
            */

            console.warn(
                "NO URDU TTS VOICE FOUND."
            );

            console.warn(
                "Install an Urdu speech voice in Windows/browser."
            );

        }

    }


    // ========================================================
    // ENGLISH
    // ========================================================

    else {

        utterance.lang =
            "en-US";


        const englishVoice =
            findFemaleEnglishVoice();


        if (englishVoice) {

            utterance.voice =
                englishVoice;


            console.log(
                "Nova English voice:",
                englishVoice.name,
                englishVoice.lang
            );

        }

    }


    // ========================================================
    // VOICE CHARACTER
    // ========================================================

    utterance.rate =
        language === "ur"
            ? 0.85
            : 0.92;


    utterance.pitch =
        1.12;


    utterance.volume =
        1.0;


    // ========================================================
    // EVENTS
    // ========================================================

    utterance.onstart =
        function () {

            statusText.textContent =
                "Nova is speaking...";

        };


    utterance.onend =
        function () {

            statusText.textContent =
                "Ready";

        };


    utterance.onerror =
        function (event) {

            console.error(
                "TTS ERROR:",
                event
            );

            statusText.textContent =
                "Ready";

        };


    // ========================================================
    // SPEAK
    // ========================================================

    window.speechSynthesis.speak(
        utterance
    );

}


// ============================================================
// SPEECH RECOGNITION
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    console.error(
        "Speech Recognition not supported."
    );


    assistantText.textContent =
        "Please use Google Chrome or Microsoft Edge.";

    micButton.disabled = true;

}


// ============================================================
// CREATE RECOGNITION
// ============================================================

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
// LANGUAGE SELECTION
// ============================================================

languageButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                languageButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                selectedLanguage =
                    this.dataset.language;


                if (
                    selectedLanguage ===
                    "ur-PK"
                ) {

                    assistantSubtitle.textContent =
                        "اردو میں سوال پوچھیں";

                }

                else if (
                    selectedLanguage ===
                    "en-US"
                ) {

                    assistantSubtitle.textContent =
                        "Ask your question in English";

                }

                else {

                    assistantSubtitle.textContent =
                        "Ask me something in Urdu or English";

                }

            }
        );

    }
);


// ============================================================
// NORMALIZE TEXT
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
// WORD SIMILARITY
// ============================================================

function calculateSimilarity(
    input,
    target
) {

    input =
        normalizeText(input);

    target =
        normalizeText(target);


    // Exact match

    if (
        input === target
    ) {

        return 1;

    }


    // Phrase match

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


    if (
        total === 0
    ) {

        return 0;

    }


    return matches / total;

}


// ============================================================
// FIND BEST JSON QUESTION
// ============================================================

function findBestQuestion(
    userQuestion,
    language
) {

    let bestMatch = null;

    let bestScore = 0;


    questions.forEach(
        function (item) {

            const databaseQuestion =
                language === "ur"
                    ? item.question_ur
                    : item.question_en;


            if (
                !databaseQuestion
            ) {

                return;

            }


            const score =
                calculateSimilarity(
                    userQuestion,
                    databaseQuestion
                );


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                bestMatch =
                    item;

            }

        }
    );


    return {

        item:
            bestMatch,

        score:
            bestScore

    };

}


// ============================================================
// GET ANSWER
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


    console.log(
        "Nova match:",
        result
    );


    /*
        Match threshold.

        0.30 = forgiving

        You can increase this to 0.40
        if Nova gives wrong answers.
    */

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

                found:
                    false

            };

        }


        return {

            text:
                "Sorry, I could not find an answer to that question in my database.",

            found:
                false

        };

    }


    // ========================================================
    // URDU ANSWER
    // ========================================================

    if (
        language === "ur"
    ) {

        return {

            text:
                result.item.answer_ur,

            found:
                true

        };

    }


    // ========================================================
    // ENGLISH ANSWER
    // ========================================================

    return {

        text:
            result.item.answer_en,

        found:
            true

    };

}


// ============================================================
// PROCESS QUESTION
// ============================================================

function processQuestion(
    question
) {

    question =
        question.trim();


    if (
        !question
    ) {

        return;

    }


    // --------------------------------------------------------
    // Detect language from actual text.
    // --------------------------------------------------------

    const language =
        detectLanguage(
            question
        );


    console.log(
        "Nova detected:",
        language
    );


    // --------------------------------------------------------
    // Display user question.
    // --------------------------------------------------------

    userText.textContent =
        question;


    // --------------------------------------------------------
    // Get answer.
    // --------------------------------------------------------

    const result =
        getAnswer(
            question,
            language
        );


    // --------------------------------------------------------
    // Display answer.
    // --------------------------------------------------------

    assistantText.textContent =
        result.text;


    // --------------------------------------------------------
    // Speak answer in same language.
    // --------------------------------------------------------

    speak(
        result.text,
        language
    );

}


// ============================================================
// START LISTENING
// ============================================================

function startListening() {

    if (
        !recognition
    ) {

        return;

    }


    if (
        isListening
    ) {

        return;

    }


    // ========================================================
    // SELECT RECOGNITION LANGUAGE
    // ========================================================

    if (
        selectedLanguage ===
        "ur-PK"
    ) {

        recognition.lang =
            "ur-PK";

    }

    else if (
        selectedLanguage ===
        "en-US"
    ) {

        recognition.lang =
            "en-US";

    }

    else {

        /*
            IMPORTANT:

            Auto mode defaults to Urdu because
            your primary requirement is Urdu.

            If you want English, press English.
        */

        recognition.lang =
            "ur-PK";

    }


    console.log(
        "Recognition language:",
        recognition.lang
    );


    try {

        recognition.start();

    }

    catch (error) {

        console.error(
            "Recognition start error:",
            error
        );

        return;

    }


    isListening =
        true;


    assistantCircle.classList.add(
        "listening"
    );


    micButtonText.textContent =
        "Listening...";


    statusText.textContent =
        "Listening";


    statusDot.style.background =
        "#ef4444";


    statusDot.style.boxShadow =
        "0 0 10px #ef4444";

}


// ============================================================
// STOP LISTENING
// ============================================================

function stopListening() {

    if (
        !recognition
    ) {

        return;

    }


    try {

        recognition.stop();

    }

    catch (error) {

        console.log(error);

    }


    resetListeningUI();

}


// ============================================================
// RESET UI
// ============================================================

function resetListeningUI() {

    isListening =
        false;


    assistantCircle.classList.remove(
        "listening"
    );


    micButtonText.textContent =
        "Start Listening";


    statusText.textContent =
        "Ready";


    statusDot.style.background =
        "#22c55e";


    statusDot.style.boxShadow =
        "0 0 10px #22c55e";

}


// ============================================================
// SPEECH RESULT
// ============================================================

if (
    recognition
) {

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
                "RAW RECOGNITION:",
                transcript
            );


            /*
                Even if browser returns Roman Urdu,
                we can't magically convert it into Urdu
                script here.

                Therefore the user should select
                Urdu mode when speaking Urdu.
            */


            processQuestion(
                transcript
            );

        };


    // ========================================================
    // RECOGNITION ERROR
    // ========================================================

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

                assistantText.textContent =
                    "Please allow microphone access for Nova.";

            }

            else if (
                event.error ===
                "no-speech"
            ) {

                assistantText.textContent =
                    "Nova didn't hear anything. Please try again.";

            }

            else if (
                event.error ===
                "network"
            ) {

                assistantText.textContent =
                    "Speech recognition requires a network connection in this browser.";

            }

            else {

                assistantText.textContent =
                    "Nova could not understand that. Please try again.";

            }


            resetListeningUI();

        };


    // ========================================================
    // RECOGNITION END
    // ========================================================

    recognition.onend =
        function () {

            resetListeningUI();

        };

}


// ============================================================
// MICROPHONE BUTTON
// ============================================================

micButton.addEventListener(
    "click",
    startListening
);


// ============================================================
// STOP BUTTON
// ============================================================

stopButton.addEventListener(
    "click",
    stopListening
);


// ============================================================
// TEXT SEND
// ============================================================

sendButton.addEventListener(
    "click",
    function () {

        const question =
            textInput.value.trim();


        if (
            !question
        ) {

            return;

        }


        processQuestion(
            question
        );


        textInput.value =
            "";

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

            sendButton.click();

        }

    }
);


// ============================================================
// INITIALIZE NOVA
// ============================================================

loadQuestions();


// Make sure voices are loaded.

setTimeout(
    function () {

        loadVoices();

    },
    1000
);