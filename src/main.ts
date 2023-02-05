import Board from "./generator/board";
import {RandomBoardInterface} from "./generator/boardGenerator";
import Viewer from "./viewer/Viewer";

const _startValues: RandomBoardInterface = {
    checkpoints: 2,
    height: 9,
    lembasFields: 5,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: false,
    rivers: true,
    startFields: 6,
    width: 16,
    holes: 8,
    walls: true,
    riverAlgorithm: "complex"
};

const generator = Board.generateRandom(_startValues, null, true);
const viewer = new Viewer(generator);
viewer.draw("board-david");

const generator_ = Board.generateRandom({..._startValues, riverAlgorithm: "default"});
const viewer_ = new Viewer(generator_);
viewer_.draw("board-nick");
process.stdout.write("\x07");