import Board from "./generator/board";
import {RandomBoardInterface} from "./generator/boardGenerator";

let timeSumSmall = 0;
const runsSmall = 16;
let wallsSmall = 0;

const _startValuesSmall: RandomBoardInterface = {
    checkpoints: 1,
    height: 64,
    lembasFields: 0,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: true,
    rivers: false,
    startFields: 1,
    width: 64,
    holes: 0,
    walls: true,
    riverAlgorithm: "default"
};

function mine() {

    for (let i = 0; i < runsSmall; i++) {
        process.stdout.write(" MINE:RUN " + i + `\r`);
        const start = Date.now();
        const generator = Board.generateRandom({..._startValuesSmall, width: i + 2, height: i + 2}, () => {
            const end = Date.now();
            timeSumSmall += end - start;
        }, false);
        wallsSmall += generator.walls.length;
    }
    console.log("|---------------------------");
    console.log("| > MY ALGO Small: ");
    console.log("|\trun board dimensions: 2 to " + (runsSmall+2));
    console.log("|\twalls avg. per run: " + (wallsSmall / runsSmall));
    console.log("|\taverage: " + (timeSumSmall / runsSmall) + "ms");
    console.log("|\ttotal: " + timeSumSmall + "ms");
    console.log("|---------------------------\n");

    process.stdout.write("\x07");
}

function davids() {

    timeSumSmall = 0;
    wallsSmall = 0;
    for (let i = 0; i < runsSmall; i++) {
        process.stdout.write(" DAVID:RUN " + i + `\r`);
        const start = Date.now();
        const generator = Board.generateRandom({..._startValuesSmall, width: i + 2, height: i + 2}, () => {
            const end = Date.now();
            timeSumSmall += end - start;
        }, true);
        wallsSmall += generator.walls.length;
    }
    console.log("|---------------------------");
    console.log("| > DAVIDs ALGO Small: ");
    console.log("|\trun board dimensions: 2 to " + (runsSmall+2));
    console.log("|\twalls avg. per run: " + (wallsSmall / runsSmall));
    console.log("|\taverage: " + (timeSumSmall / runsSmall) + "ms");
    console.log("|\ttotal: " + timeSumSmall + "ms");
    console.log("|---------------------------\n");

    process.stdout.write("\x07");

}

mine();
davids();
