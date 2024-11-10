import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import LANGUAGES from "./languages.mjs";

let currentLanguage = LANGUAGES.en;

const MAIN_MENU_ITEMS = buildMenu();

const GAME_FPS = 1000 / 60; // The theoretical refresh rate of our game engine
let currentState = null;    // The current active state in our finite-state machine.
let gameLoop = null;        // Variable that keeps a refrence to the interval id assigned to our game loop 

let mainMenuScene = null;

function checkMinimumResolution(minWidth, minHeight) {
    const { columns, rows } = process.stdout;
    return columns >= minWidth && rows >= minHeight;
}

function buildLanguageMenu() {
    return [
        { text: "English", id: 0, action: () => { currentLanguage = LANGUAGES.en; mainMenuScene = createMenu(buildMenu()); currentState.next = mainMenuScene; currentState.transitionTo = "Main Menu"; } },
        { text: "Español", id: 1, action: () => { currentLanguage = LANGUAGES.es; mainMenuScene = createMenu(buildMenu()); currentState.next = mainMenuScene; currentState.transitionTo = "Main Menu"; } },
        { text: "Norsk", id: 2, action: () => { currentLanguage = LANGUAGES.no; mainMenuScene = createMenu(buildMenu()); currentState.next = mainMenuScene; currentState.transitionTo = "Main Menu"; } },
        { text: "Svenska", id: 3, action: () => { currentLanguage = LANGUAGES.se; mainMenuScene = createMenu(buildMenu()); currentState.next = mainMenuScene; currentState.transitionTo = "Main Menu"; } }
    ];
}

(function initialize() {
    const MIN_WIDTH = 80;
    const MIN_HEIGHT = 24;
    if (!checkMinimumResolution(MIN_WIDTH, MIN_HEIGHT)) {
        console.error(`Console size must be at least ${MIN_WIDTH}x${MIN_HEIGHT}.`);
        process.exit(1);
    }
    print(ANSI.HIDE_CURSOR);
    clearScreen();
    mainMenuScene = createMenu(MAIN_MENU_ITEMS);
    SplashScreen.next = mainMenuScene;
    currentState = SplashScreen;
    gameLoop = setInterval(update, GAME_FPS);
})();

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}

// Suport / Utility functions ---------------------------------------------------------------

function buildMenu() {
    let menuItemCount = 0;
    return [
        {
            text: currentLanguage.startGame, id: menuItemCount++, action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(`${currentLanguage.shipPlacement}\n${currentLanguage.firstPlayerReady}`, (player1ShipMap) => {

                    let p1map = createMapLayoutScreen(currentLanguage);
                    p1map.init(FIRST_PLAYER, (player1ShipMap) => {

                        let innbetween = createInnBetweenScreen();
                        innbetween.init(`${currentLanguage.shipPlacement}\n${currentLanguage.secondPlayerReady}`, (player2ShipMap) => {
                            let p2map = createMapLayoutScreen(currentLanguage);
                            p2map.init(SECOND_PLAYER, (player2ShipMap) => {
                                let battleshipScreen = createBattleshipScreen(player1ShipMap, player2ShipMap, currentLanguage);
                                return battleshipScreen;
                            })
                            return p2map;
                        });
                        return innbetween;
                    });

                    return p1map;

                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = "Map layout";
            }
        },
        { text: currentLanguage.exitGame, id: menuItemCount++, action: function () { print(ANSI.SHOW_CURSOR); clearScreen(); process.exit(); } },
        {
            text: currentLanguage.languageSelect, id: menuItemCount++, action: function () {
                const languageMenuItems = buildLanguageMenu();
                const languageMenu = createMenu(languageMenuItems);
                currentState.next = languageMenu;
                currentState.transitionTo = "Language Menu";
            }
        },
    ];
}
