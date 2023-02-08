import Board from "./generator/board";
import {RandomBoardInterface} from "./generator/boardGenerator";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
global.process.stdout.write = (buffer): boolean => {
    return buffer;
};

function mine(_startValues: RandomBoardInterface, runs: number, type: string) {
    let timeSumSmall = 0;
    let wallsSmall = 0;
    process.stderr.write(" NICK:RUN:" + type.toUpperCase() + "\n");
    for (let i = 0; i < runs; i++) {
        const progress = ((i / runs) * 100);
        const avg = (timeSumSmall / (i + 1));
        process.stderr.write("\tPROGRESS " + progress.toFixed(2) + `% (` + (i).toLocaleString() + "/" + runs.toLocaleString() + `) avg.: ` + avg.toFixed(4) + `ms          \r`);
        const start = Date.now();
        const generator = Board.generateRandom(_startValues, () => {
            const end = Date.now();
            timeSumSmall += end - start;
        }, false);
        wallsSmall += generator.wallCount();
    }
    process.stderr.write("\n|---------------------------\n");
    process.stderr.write("| > NICKs ALGO: " + "\n");
    process.stderr.write("|\ttype: " + type.toUpperCase() + "\n");
    process.stderr.write("|\tboard: " + _startValues.width + "x" + _startValues.height + "\n");
    process.stderr.write("|\truns: " + runs.toLocaleString() + "\n");
    process.stderr.write("|\twalls avg. per run: " + (wallsSmall / runs) + "\n");
    process.stderr.write("|\taverage: " + (timeSumSmall / runs) + "ms" + "\n");
    process.stderr.write("|\ttotal: " + timeSumSmall.toLocaleString() + "ms" + "\n");
    process.stderr.write("|---------------------------\n" + "\n");

    process.stderr.write("\x07");
}

function davids(_startValues: RandomBoardInterface, runs: number, type: string) {
    let timeSumSmall = 0;
    let wallsSmall = 0;
    process.stderr.write(" DAVID:RUN:" + type.toUpperCase() + "\n");
    for (let i = 0; i < runs; i++) {
        const progress = ((i / runs) * 100);
        const avg = (timeSumSmall / (i + 1));
        process.stderr.write("\tPROGRESS " + progress.toFixed(2) + `% (` + (i).toLocaleString() + "/" + runs.toLocaleString() + `) avg.: ` + avg.toFixed(4) + `ms          \r`);
        const start = Date.now();
        const generator = Board.generateRandom(_startValues, () => {
            const end = Date.now();
            timeSumSmall += end - start;
        }, true);
        wallsSmall += generator.wallCount();
    }
    process.stderr.write("\n|---------------------------" + "\n");
    process.stderr.write("| > DAVIDs ALGO: " + "\n");
    process.stderr.write("|\ttype: " + type.toUpperCase() + "\n");
    process.stderr.write("|\tboard: " + _startValues.width + "x" + _startValues.height + "\n");
    process.stderr.write("|\truns: " + runs.toLocaleString() + "\n");
    process.stderr.write("|\twalls avg. per run: " + (wallsSmall / runs) + "\n");
    process.stderr.write("|\taverage: " + (timeSumSmall / runs) + "ms" + "\n");
    process.stderr.write("|\ttotal: " + timeSumSmall.toLocaleString() + "ms" + "\n");
    process.stderr.write("|---------------------------\n" + "\n");

    process.stderr.write("\x07");

}

const runsSmall = 100_000;
const _startValuesSmall: RandomBoardInterface = {
    width: 2,
    height: 2,
    startFields: 2,
    checkpoints: 1,
    holes: 0,
    lembasFields: 0,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: false,
    rivers: true,
    walls: true,
    riverAlgorithm: "complex"
};

mine(_startValuesSmall, runsSmall, "small");
davids(_startValuesSmall, runsSmall, "small");

const runs = 10;
const _startValues: RandomBoardInterface = {
    width: 128,
    height: 128,
    startFields: 6,
    checkpoints: 6,
    holes: 128,
    lembasFields: 32,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: false,
    rivers: true,
    walls: true,
    riverAlgorithm: "complex"
};

mine(_startValues, runs, "big");
davids(_startValues, runs, "big");