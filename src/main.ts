import Board from "./generator/board";
import BoardGenerator, {RandomBoardInterface} from "./generator/boardGenerator";
import * as fs from "fs";

const _startValues: RandomBoardInterface = {
    checkpoints: 1,
    height: 4,
    lembasFields: 1,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: true,
    rivers: true,
    startFields: 2,
    width: 4,
    holes: 2,
    walls: true,
    riverAlgorithm: "default"
};

const {board, json} = Board.generateRandom(_startValues);

console.log(BoardGenerator.printRandomGeneratorBoard(board));

fs.writeFile("dist/board.json", JSON.stringify(json, null, 4), (err) => {
    if (err)
        console.log(err);
    else {
        console.log(fs.readFileSync("dist/board.json", "utf8"));
        fs.rmSync("dist/board.json");
    }
})