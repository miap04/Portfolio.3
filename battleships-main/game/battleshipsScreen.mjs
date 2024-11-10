import { GAME_BOARD_DIM, FIRST_PLAYER, SECOND_PLAYER } from "../consts.mjs";
import { print, clearScreen } from "../utils/io.mjs";
import { ANSI } from "../utils/ansi.mjs";
import KeyBoardManager from "../utils/io.mjs";
import createGameBoard from "../game/gameBoard.mjs";
import createMenu from "../utils/menu.mjs";
import LANGUAGES from "../languages.mjs";


const createBattleshipScreen = (player1ShipMap, player2ShipMap, currentLanguage = LANGUAGES.en) => {
    let currentPlayer = FIRST_PLAYER;
    let firstPlayerBoard = createGameBoard(GAME_BOARD_DIM);
    let secondPlayerBoard = createGameBoard(GAME_BOARD_DIM);

    firstPlayerBoard.ships = player1ShipMap;
    secondPlayerBoard.ships = player2ShipMap;

    let lastShotRowPlayer1 = -1;
    let lastShotColumnPlayer1 = -1;
    let lastShotRowPlayer2 = -1;
    let lastShotColumnPlayer2 = -1;

    function swapBoard(screen) {
        currentPlayer *= -1;
        if (currentPlayer == FIRST_PLAYER) {
            screen.currentBoard = firstPlayerBoard;
            screen.opponentBoard = secondPlayerBoard;
        } else {
            screen.currentBoard = secondPlayerBoard;
            screen.opponentBoard = firstPlayerBoard;
        }
    }

    function checkForWin(board) {
        for (let row of board.ships) {
            for (let cell of row) {
                if (cell !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    return {
        isDrawn: false,
        next: null,
        transitionTo: null,
        currentBoard: firstPlayerBoard,
        opponentBoard: secondPlayerBoard,
        cursorRow: 0,
        cursorColumn: 0,

        init: function (firstPBoard, secondPBoard) {
            firstPlayerBoard.ships = firstPBoard;
            secondPlayerBoard.ships = secondPBoard;
            this.currentBoard = firstPlayerBoard;
            this.opponentBoard = secondPlayerBoard;
        },

        update: function (dt) {
            if (KeyBoardManager.isEnterPressed()) {
                const row = this.cursorRow;
                const column = this.cursorColumn;
                let wasHit = false;
                if (this.opponentBoard.target[row][column] === 'X' || this.opponentBoard.target[row][column] === 'O') {
                    return;
                }
                if (this.opponentBoard.ships[row][column] != 0) {
                    this.opponentBoard.ships[row][column] = 0;
                    this.opponentBoard.target[row][column] = 'X';
                    wasHit = true;
                } else {
                    this.opponentBoard.target[row][column] = 'O';
                }

                if (currentPlayer === FIRST_PLAYER) {
                    lastShotRowPlayer1 = row;
                    lastShotColumnPlayer1 = column;
                } else {
                    lastShotRowPlayer2 = row;
                    lastShotColumnPlayer2 = column;
                }

                if (checkForWin(this.opponentBoard)) {
                    this.transitionTo = "Game Over";
                    let endMessage = `${currentLanguage.gameOver}, `;
                    if (currentPlayer === FIRST_PLAYER) {
                        endMessage += `${currentLanguage.player1wins}`;
                    } else {
                        endMessage += `${currentLanguage.player2wins}`;
                    }
                    this.next = createMenu([{ text: endMessage, id: 0, action: () => process.exit() }]);
                } else if (!wasHit) {
                    swapBoard(this);
                }
                this.isDrawn = false;
            }
            if (KeyBoardManager.isUpPressed()) {
                this.cursorRow = Math.max(0, this.cursorRow - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isDownPressed()) {
                this.cursorRow = Math.min(GAME_BOARD_DIM - 1, this.cursorRow + 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isLeftPressed()) {
                this.cursorColumn = Math.max(0, this.cursorColumn - 1);
                this.isDrawn = false;
            }
            if (KeyBoardManager.isRightPressed()) {
                this.cursorColumn = Math.min(GAME_BOARD_DIM - 1, this.cursorColumn + 1);
                this.isDrawn = false;
            }
        },

        draw: function (dr) {
            if (this.isDrawn) return;
            this.isDrawn = true;

            clearScreen();

            let output = `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${currentLanguage.gamePhase}\n\n${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}`;
            output += `${currentLanguage.playerTurn.replace('{player}', currentPlayer === FIRST_PLAYER ? '1' : '2')}\n\n`;

            output += '  ';
            for (let i = 0; i < GAME_BOARD_DIM; i++) {
                output += ` ${String.fromCharCode(65 + i)}`;
            }
            output += '\n';

            for (let y = 0; y < GAME_BOARD_DIM; y++) {
                output += `${String(y + 1).padStart(2, ' ')} `;
                for (let x = 0; x < GAME_BOARD_DIM; x++) {
                    const cell = this.opponentBoard.target[y][x];
                    if (y === this.cursorRow && x === this.cursorColumn) {
                        output += ANSI.COLOR.RED + '█' + ANSI.RESET + ' ';
                    } else if (currentPlayer === SECOND_PLAYER && y === lastShotRowPlayer2 && x === lastShotColumnPlayer2) {
                        if (cell === 'X') {
                            output += ANSI.COLOR.YELLOW + 'X' + ANSI.RESET + ' ';
                        }
                        else {
                            output += ANSI.COLOR.YELLOW + 'O' + ANSI.RESET + ' ';
                        }
                    } else if (currentPlayer === FIRST_PLAYER && y === lastShotRowPlayer1 && x === lastShotColumnPlayer1) {
                        if (cell === 'X') {
                            output += ANSI.COLOR.YELLOW + 'X' + ANSI.RESET + ' ';
                        }
                        else {
                            output += ANSI.COLOR.YELLOW + 'O' + ANSI.RESET + ' ';
                        }
                    } else if (cell === 'X') {
                        output += ANSI.COLOR.GREEN + 'X' + ANSI.RESET + ' ';
                    } else if (cell === 'O') {
                        output += ANSI.COLOR.WHITE + 'O' + ANSI.RESET + ' ';
                    } else {
                        output += ANSI.SEA + ' ' + ANSI.RESET + ' ';
                    }
                }
                output += `${y + 1}\n`;
            }

            output += '  ';
            for (let i = 0; i < GAME_BOARD_DIM; i++) {
                output += ` ${String.fromCharCode(65 + i)}`;
            }
            output += '\n\n';

            output += `${ANSI.TEXT.BOLD}${ANSI.COLOR.YELLOW}${currentLanguage.controls}${ANSI.TEXT.BOLD_OFF}${ANSI.RESET}\n`;
            output += `${currentLanguage.moveCursor}\n`;
            output += `${currentLanguage.attack}\n`;

            print(output);
        }
    };
};

export default createBattleshipScreen;