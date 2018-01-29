/**
 * Contains the dictionary of language entries.
 */
lang.SRSetup = {
    speechRecognition: 'Speech Recognition',
    noSpeechRecognition: 'Your browser does not support Speech Recognition. Try Google Chrome.',
    noSpeechRecognitionOpera: 'Currently January 2018 the Opera browser does not support Speech Recognition. Try Google Chrome.',
    language: 'Language',
    languageHelp: 'The language of the current speech recognition. You can add/remove language in your browser settings.',
    chromeLanguagesSettings: 'Open chrome://settings/ page, click Advanced and go to the Languages section.',
    help: 'Please click the 🎤 button in the bottom right corner of the panel and say a message',
    errors: {
        noNpeech: 'No speech was detected.',
        aborted: 'Speech input was aborted in some manner, perhaps by some user-agent-specific behavior like a button the user can press to cancel speech input.',
        audioCapture: 'Audio capture failed.',
        network: 'Network communication required for completing the recognition failed.',
        notAllowed: 'Your browser disallowed any speech input from occurring for reasons of security, privacy or user preference.\n Probably, your microphone is not setup or not allowed for our site.',
        allowMicChrome: 'Open chrome://settings/ page,\nclick "Advanced",\ngo to the "Privacy and security" section,\nclick "Content settings",\nclick "Microphone",\nremove our site from "Block" list.',
        serviceNotAllowed: "Your browser disallowed the requested speech recognition service, either because your browser doesn't support it or because of reasons of security, privacy or user preference. In this case it would allow another more suitable speech recognition service to be used instead.",
        badGrammar: 'There was an error in the speech recognition grammar or semantic tags, or the chosen grammar format or semantic tag format was unsupported.',
        languageNotSupported: 'The language was not supported.',
    }
};

