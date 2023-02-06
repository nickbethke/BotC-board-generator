import Board from "./generator/board";
import {RandomBoardInterface} from "./generator/boardGenerator";
import Viewer from "./viewer/Viewer";

// DONE: wall generation -> holes!
// TODO: walls between rivers?
/* DONE: Pathfinding: von allen Startfeldern zu einem, und von dem zu allen Checkpoints einmal -> nicht mehr exponentieller Wachstum */

const _startValues: RandomBoardInterface = {
    width: 128,
    height: 128,
    startFields: 6,
    checkpoints: 6,
    holes: 128,
    lembasFields: 128,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: false,
    rivers: true,
    walls: true,
    riverAlgorithm: "complex"
};

process.stdout.write(" NICK:RUN " + `\n`);
const generator_ = Board.generateRandom(_startValues);
process.stdout.write(" NICK:RUN:WALLS " + generator_.json.walls.length + `\n`);
const viewer_ = new Viewer(generator_);
viewer_.draw("board-nick");

process.stdout.write(" DAVID:RUN " + `\n`);
const generator = Board.generateRandom(_startValues, null, true);
process.stdout.write(" DAVID:RUN:WALLS " + generator.json.walls.length + `\n`);
const viewer = new Viewer(generator);
viewer.draw("board-david");

process.stdout.write("\x07");