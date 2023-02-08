import Board from "./generator/board";
import {RandomBoardInterface} from "./generator/boardGenerator";
import Viewer from "./viewer/Viewer";

// DONE: wall generation -> holes!
// TODO: walls between rivers?
/* DONE: Pathfinding: von allen Startfeldern zu einem, und von dem zu allen Checkpoints einmal -> nicht mehr exponentieller Wachstum */
const multiplier = 1;
const _startValues: RandomBoardInterface = {
    width: 16 * multiplier,
    height: 9 * multiplier,
    startFields: 6,
    checkpoints: 6 * multiplier,
    holes: 16 * multiplier,
    lembasFields: 16 * multiplier,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: false,
    rivers: true,
    walls: true,
    riverAlgorithm: "complex"
};


process.stdout.write(" DAVID:RUN " + `\n`);
const generator = Board.generateRandom(_startValues, null, true);
process.stdout.write(" DAVID:RUN : WALLS " + generator.wallCount() + `\n`);
const viewer = new Viewer(generator);
viewer.draw("board-david");
viewer.drawSVG("board-david")

process.stdout.write(" NICK:RUN " + `\n`);
const generator_ = Board.generateRandom(_startValues);
process.stdout.write(" NICK:RUN : WALLS " + generator_.wallCount() + `\n`);
const viewer_ = new Viewer(generator_);
viewer_.draw("board-nick");
viewer_.drawSVG("board-nick")

process.stdout.write("\x07");