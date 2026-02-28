import {isRtl} from 'scratch-l10n';
import editorMessages from 'scratch-l10n/locales/editor-msgs';

const UPDATE_LOCALES = 'scratch-gui/locales/UPDATE_LOCALES';
const SELECT_LOCALE = 'scratch-gui/locales/SELECT_LOCALE';

// Messages missing from scratch-l10n that are defined in scratch-gui source.
// English defaults are merged into every locale so react-intl does not warn.
const supplementalMessages = {
    'gui.sharedMessages.backdrop': 'backdrop{index}',
    'gui.sharedMessages.costume': 'costume{index}',
    'gui.sharedMessages.sprite': 'Sprite{index}',
    'gui.sharedMessages.pop': 'pop',
    'gui.sharedMessages.replaceProjectWarning': 'Replace contents of the current project?',
    'gui.sharedMessages.loadFromComputerTitle': 'Load from your computer',
    'gui.aria.clearButton': 'Clear',
    'gui.libraryItem.memberAssetImgAlt': 'Blue star icon indicating an asset is for members',
    'gui.library.membershipTag': 'Membership',
    'gui.menuBar.colorMode': 'Color Mode',
    'gui.menuBar.theme': 'Theme',
    'gui.opcodeLabels.online': 'online'
};

// German translations for supplemental messages and debug modal
const deTranslations = {
    // shared messages
    'gui.sharedMessages.backdrop': 'Bühnenbild{index}',
    'gui.sharedMessages.costume': 'Kostüm{index}',
    'gui.sharedMessages.sprite': 'Figur{index}',
    'gui.sharedMessages.pop': 'Plopp',
    'gui.sharedMessages.replaceProjectWarning': 'Inhalt des aktuellen Projekts ersetzen?',
    'gui.sharedMessages.loadFromComputerTitle': 'Von deinem Computer laden',
    'gui.aria.clearButton': 'Löschen',
    'gui.libraryItem.memberAssetImgAlt': 'Blaues Sternsymbol zeigt an, dass ein Element nur für Mitglieder verfügbar ist',
    'gui.library.membershipTag': 'Mitgliedschaft',
    'gui.menuBar.colorMode': 'Farbmodus',
    'gui.menuBar.theme': 'Design',
    'gui.opcodeLabels.online': 'online',
    // debug modal
    'gui.debugModal.title': 'Fehlersuche | Weiterkommen',
    'gui.debugModal.readAloud.title': 'Laut vorlesen',
    'gui.debugModal.readAloud.description1': 'Während du deinen Code laut vorliest, denke aus der Sicht des Computers.',
    'gui.debugModal.readAloud.description2': 'Fügst du Schritte hinzu, die gar nicht vorhanden sind?',
    'gui.debugModal.readAloud.description3': 'Sind deine Anweisungen verständlich?',
    'gui.debugModal.readAloud.description4':
        'Wenn etwas bei jedem Programmdurchlauf zurückgesetzt werden muss, sind diese Anweisungen enthalten?',
    'gui.debugModal.breakItDown.title': 'In Teile zerlegen',
    'gui.debugModal.breakItDown.description1':
        'Trenne die Blöcke in kleinere Abschnitte (oder Sequenzen) und klicke darauf, um zu sehen, was jede Sequenz macht.',
    'gui.debugModal.breakItDown.description2':
        'Sobald die kleineren Sequenzen wie erwartet funktionieren, füge sie wieder in das Hauptprogramm ein.',
    'gui.debugModal.breakItDown.description3': 'Dieser Vorgang wird Dekomposition genannt.',
    'gui.debugModal.slowItDown.title': 'Verlangsamen',
    'gui.debugModal.slowItDown.description1':
        'Der Computer führt dein Programm so schnell aus, dass es schwer sein kann, mit den Augen zu folgen.',
    'gui.debugModal.slowItDown.description2':
        'Füge temporäre „warte"- oder „warte bis"-Blöcke ein, um die Sequenz zu verlangsamen. So hast du Zeit zu erkennen, ob ein Teil funktioniert hat oder nicht.',
    'gui.debugModal.slowItDown.description3': 'Entferne diese Warte-Blöcke, sobald dein Code funktioniert.',
    'gui.debugModal.addSoundCheckpoints.title': 'Klang-Kontrollpunkte hinzufügen',
    'gui.debugModal.addSoundCheckpoints.description1':
        'Ähnlich wie bei der Verlangsamungsstrategie kannst du mit dem Block „spiele Klang ganz" an wichtigen Stellen verschiedene Klänge hinzufügen, um deine Sequenz zu testen.',
    'gui.debugModal.addSoundCheckpoints.description2':
        'Wenn ein Klang nicht abgespielt wird, liegt der Fehler möglicherweise vor diesem Block. Wenn der Klang abgespielt wird, liegt der Fehler wahrscheinlich nach diesem Block.',
    'gui.debugModal.addSoundCheckpoints.description3': 'Entferne die Klänge, sobald dein Code funktioniert.',
    'gui.debugModal.tinkerWithBlockOrder.title': 'Blockreihenfolge anpassen',
    'gui.debugModal.tinkerWithBlockOrder.description1': 'Versuche, die Reihenfolge/Sequenz der Blöcke zu ändern.',
    'gui.debugModal.tinkerWithBlockOrder.description2': 'Was muss zuerst passieren?',
    'gui.debugModal.tinkerWithBlockOrder.description3': 'Was passiert als Zweites?',
    'gui.debugModal.tinkerWithBlockOrder.description4':
        'Müssen Werte oder Figuren zurückgesetzt werden, bevor der nächste Codeabschnitt ausgeführt wird?',
    'gui.debugModal.tinkerWithBlockOrder.description5':
        'Versuche, Blöcke innerhalb einer Schleife oder Bedingung zu verwenden, statt außerhalb davon.',
    'gui.debugModal.toLoopOrNot.title': 'Schleife oder keine Schleife',
    'gui.debugModal.toLoopOrNot.description1':
        'Wenn du Steuerungsblöcke wie „wiederhole fortlaufend" und „wiederhole" verwendest, überprüfe, ob alle Blöcke innerhalb der Schleife dort sein sollten oder ob ein Block (wie „warte") fehlt, um die Aktion zurückzusetzen oder das Timing anzupassen. Soll deine Schleife endlos oder eine bestimmte Anzahl von Malen laufen? Soll etwas die Schleife beenden?',
    'gui.debugModal.toLoopOrNot.description2':
        'Vielleicht verwendest du keine Schleife, obwohl du eine verwenden solltest? Wenn du zum Beispiel einen Bedingungsblock wie „falls … dann" verwendest: Muss das Programm nur einmal prüfen, ob es wahr oder falsch ist? Oder muss es kontinuierlich prüfen – dann solltest du deinen Bedingungsblock in eine „wiederhole fortlaufend"-Schleife setzen.',
    'gui.debugModal.timingAndParallelism.title': 'Über Timing & Parallelität nachdenken',
    'gui.debugModal.timingAndParallelism.sectionTitle': 'Timing & Parallelität',
    'gui.debugModal.timingAndParallelism.description1':
        'Hast du mehrere Ereignisse, die gleichzeitig ablaufen sollen? Wenn zwei Sequenzen so programmiert sind, dass sie gleichzeitig starten, kann es zu unvorhersehbarem Verhalten kommen.',
    'gui.debugModal.timingAndParallelism.description2':
        'Füge kurze Wartezeiten, Nachrichten oder Benutzerinteraktionen (wie Klicken oder Tastendrücken) hinzu, um zu sehen, ob sich das Ergebnis ändert.',
    'gui.debugModal.thinkAboutBlockOptions.title': 'Über Blockoptionen nachdenken',
    'gui.debugModal.thinkAboutBlockOptions.description1': 'Gibt es einen ähnlichen, aber anderen Block, den du verwenden kannst?',
    'gui.debugModal.thinkAboutBlockOptions.description2':
        'Manche Blöcke sehen ähnlich aus, verhalten sich aber unterschiedlich, z.\u00A0B. „setze" vs. „ändere" oder „spiele Klang ganz" vs. „spiele Klang".',
    'gui.debugModal.thinkAboutBlockOptions.description3':
        'Versuche, einen ähnlichen Block anstelle des vorhandenen zu verwenden, und beobachte, ob sich das Ergebnis ändert.',
    'gui.debugModal.checkTheValues.title': 'Werte überprüfen',
    'gui.debugModal.checkTheValues.description1':
        'Wenn du Variablen oder Ausgabeblöcke verwendest, überprüfe den Wert in dem Moment, in dem die Codesequenz ausgeführt wird.',
    'gui.debugModal.checkTheValues.description2':
        'Sollen alle Figuren eine Variable steuern, oder sollte nur eine Figur die Kontrolle haben?',
    'gui.debugModal.checkTheValues.description3': 'Wo wird der Wert zurückgesetzt? Wo wird er geändert?',
    'gui.debugModal.checkCodeSequence.title': 'Codesequenz überprüfen',
    'gui.debugModal.checkCodeSequence.description1':
        'Überprüfe, ob deine Codesequenz der richtigen Figur oder dem Bühnenbild zugeordnet ist.',
    'gui.debugModal.checkCodeSequence.description2':
        'Wenn du deinen Code zu einer anderen Figur verschieben musst, klicke und ziehe ihn, bis du über der richtigen Figur schwebst. Lasse los, sobald die Figur wackelt.',
    'gui.debugModal.checkCodeSequence.description3':
        'Du kannst auch deinen Rucksack (am unteren Bildschirmrand) verwenden, um Code oder Elemente zu speichern und zu verschieben.',
    'gui.debugModal.commentYourCode.title': 'Kommentiere deinen Code',
    'gui.debugModal.commentYourCode.description1':
        'Kommentare in deinem Code helfen anderen, deinen Code zu verstehen. Sie helfen auch dir selbst, dich später daran zu erinnern, wie dein Code funktioniert.',
    'gui.debugModal.commentYourCode.description2':
        'Klicke mit der rechten Maustaste auf den Skriptbereich und wähle „Kommentar hinzufügen". Verwende Alltagssprache, um zu erklären, was ein Block oder eine kleine Blockfolge macht.',
    'gui.debugModal.takeABreak.title': 'Mach eine Pause, tritt zurück',
    'gui.debugModal.takeABreak.description1':
        'Manchmal kann es kontraproduktiv und frustrierend sein, zu lange an einem Problem zu arbeiten.',
    'gui.debugModal.takeABreak.description2':
        'Mach eine Pause und geh vom Bildschirm weg, um den Kopf freizubekommen. Nach etwas Erholung, einer anderen Beschäftigung oder einem Glas Wasser kannst du das Problem mit frischen Augen angehen.',
    'gui.debugModal.askForHelp.title': 'Frag nach Hilfe',
    'gui.debugModal.askForHelp.description1':
        'Wenn du immer noch nicht weiterkommst, kannst du andere um Hilfe bitten. Suche ein Debugging-/Hilfe-Studio und teile dein Projekt, indem du in einem Kommentar oder in den Projektnotizen um Hilfe bittest.',
    'gui.debugModal.askForHelp.description2':
        'Bitte ein bis drei Personen, deinen Code auszuprobieren – verschiedene Leute haben vielleicht andere Perspektiven oder Lösungen!'
};

// Patch every locale with supplemental English defaults, then apply German translations
Object.keys(editorMessages).forEach(locale => {
    if (locale === '__esModule') return;
    Object.keys(supplementalMessages).forEach(id => {
        if (!editorMessages[locale][id]) {
            editorMessages[locale][id] = supplementalMessages[id];
        }
    });
});

// Apply German translations
Object.keys(deTranslations).forEach(id => {
    editorMessages.de[id] = deTranslations[id];
});

const initialState = {
    isRtl: false,
    locale: 'en',
    messagesByLocale: editorMessages,
    messages: editorMessages.en
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SELECT_LOCALE:
        return Object.assign({}, state, {
            isRtl: isRtl(action.locale),
            locale: action.locale,
            messagesByLocale: state.messagesByLocale,
            messages: state.messagesByLocale[action.locale]
        });
    case UPDATE_LOCALES:
        return Object.assign({}, state, {
            isRtl: state.isRtl,
            locale: state.locale,
            messagesByLocale: action.messagesByLocale,
            messages: action.messagesByLocale[state.locale]
        });
    default:
        return state;
    }
};

const selectLocale = function (locale) {
    return {
        type: SELECT_LOCALE,
        locale: locale
    };
};

const setLocales = function (localesMessages) {
    return {
        type: UPDATE_LOCALES,
        messagesByLocale: localesMessages
    };
};
const initLocale = function (currentState, locale) {
    if (Object.prototype.hasOwnProperty.call(currentState.messagesByLocale, locale)) {
        return Object.assign(
            {},
            currentState,
            {
                isRtl: isRtl(locale),
                locale: locale,
                messagesByLocale: currentState.messagesByLocale,
                messages: currentState.messagesByLocale[locale]
            }
        );
    }
    // don't change locale if it's not in the current messages
    return currentState;
};
export {
    reducer as default,
    initialState as localesInitialState,
    initLocale,
    selectLocale,
    setLocales
};
