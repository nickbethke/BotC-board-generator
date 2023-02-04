import {expect} from "@jest/globals";
import Board from "./generator/board";
import {defaultStartValues, RandomBoardInterface,} from "./generator/boardGenerator";
import PathFinder from "./generator/helper/pathFinder";
import FieldWithPositionInterface from "./interfaces/fieldWithPositionInterface";
import SauronsEye from "./generator/fields/sauronsEye";
import {DirectionEnum} from "./interfaces/boardConfigInterface";
import StartField from "./generator/fields/startField";
import Grass from "./generator/fields/grass";
import Checkpoint from "./generator/fields/checkpoint";
import River from "./generator/fields/river";
import JSONValidation from "./JSONValidation";

const _startValues: RandomBoardInterface = {
    checkpoints: 2,
    height: 5,
    lembasFields: 2,
    maxLembasAmountOnField: 3,
    lembasAmountExactMaximum: true,
    rivers: true,
    startFields: 2,
    width: 5,
    holes: 2,
    walls: false,
    riverAlgorithm: "default",
    name: "Test Board"
};

test("start values equal after generation", () => {
    const {startValues, json} = Board.generateRandom(_startValues);
    expect(startValues).toStrictEqual(_startValues);
    expect(new JSONValidation(json).valid()).toBe(true);
});

test("no start values equal to default after generation", () => {
    const {startValues, json} = Board.generateRandom();
    expect(startValues).toStrictEqual(defaultStartValues);
    expect(new JSONValidation(json).valid()).toBe(true);
});
test("board dimensions", () => {
    const {board, json} = Board.generateRandom();
    expect(board.length).toBe(defaultStartValues.height);
    expect(board[0].length).toBe(defaultStartValues.width);
    expect(new JSONValidation(json).valid()).toBe(true);
});

test("free space count", () => {
    const generator = Board.generateRandom({rivers: false});
    expect(generator.getFreeFieldsCount()).toBe(0);
    expect(new JSONValidation(generator.json).valid()).toBe(true);
});

test("default board", () => {
    const generator = Board.generateRandom();
    const {startValues} = generator;
    expect(startValues).toStrictEqual(defaultStartValues);
    expect(generator.getFreeFieldsCount()).toBe(0);
    expect(new JSONValidation(generator.json).valid()).toBe(true);
});

test("too small board", () => {
    expect(() => {
        Board.generateRandom({checkpoints: 3})
    }).toThrowError()
});

test("max walls on 3x3", () => {
    const board: Array<Array<FieldWithPositionInterface>> = [
        [
            new Grass({x: 0, y: 0}),
            new SauronsEye({x: 1, y: 0}, DirectionEnum.NORTH),
            new StartField({x: 2, y: 0}, DirectionEnum.NORTH),

        ],
        [
            new StartField({x: 0, y: 1}, DirectionEnum.NORTH),
            new Checkpoint({x: 1, y: 1}, 0),
            new River({x: 1, y: 1}, DirectionEnum.NORTH),
        ], [
            new Grass({x: 0, y: 2}),
            new Checkpoint({x: 1, y: 2}, 1),
            new Grass({x: 2, y: 2}),
        ]
    ]

    const walls: Array<[[number, number], [number, number]]> = [
        [
            [0, 2],
            [1, 2]
        ],
        [
            [2, 2],
            [1, 2]
        ],
        [
            [0, 1],
            [0, 2]
        ],
        [
            [2, 1],
            [2, 2]
        ],
        [
            [0, 0],
            [1, 0]
        ],
        [
            [0, 0],
            [0, 1]
        ],
        [
            [1, 0],
            [1, 1]
        ],
        [
            [1, 0],
            [2, 0]
        ]
    ]
    const checkpoints = [
        {x: 1, y: 1},
        {x: 1, y: 2}
    ]
    const startFields = [
        {x: 0, y: 1},
        {x: 2, y: 0}
    ]
    expect(new PathFinder(board, walls, 3, 3, checkpoints, startFields).check()).toBe(true);
});

test("board maximal wall count", () => {
    let x = 3;
    let y = 3;
    let sides = ((x - 1) * y) + ((y - 1) * x);
    expect(sides).toBe(12);

    x = 4;
    y = 1;
    sides = ((x - 1) * y) + ((y - 1) * x);
    expect(sides).toBe(3);

    x = 5;
    y = 4;
    sides = ((x - 1) * y) + ((y - 1) * x);
    expect(sides).toBe(31);
})

test("giant board", () => {
    const generator = Board.generateRandom({
        checkpoints: 6,
        height: 256,
        lembasFields: 16,
        maxLembasAmountOnField: 3,
        lembasAmountExactMaximum: true,
        rivers: true,
        startFields: 6,
        width: 256,
        holes: 10,
        walls: true,
        riverAlgorithm: "default",
        name: "Giant Board"
    });
    expect(new JSONValidation(generator.json).valid()).toBe(true);
});