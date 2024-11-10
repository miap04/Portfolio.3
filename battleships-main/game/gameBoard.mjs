import { create2DArrayWithFill } from "../utils/array.mjs";

function createGameBoard(dim) {
    return {
        ships: create2DArrayWithFill(dim, 0),
        target: create2DArrayWithFill(dim, 0)
    };
}

export default createGameBoard;