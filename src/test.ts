import {expect} from "@jest/globals";
import Board from "./generator/board";
import BoardGenerator, {defaultStartValues, RandomBoardInterface,} from "./generator/boardGenerator";
import FieldWithPositionInterface from "./interfaces/fieldWithPositionInterface";
import SauronsEye from "./generator/fields/sauronsEye";
import {DirectionEnum} from "./interfaces/boardConfigInterface";
import StartField from "./generator/fields/startField";
import Grass from "./generator/fields/grass";
import Checkpoint from "./generator/fields/checkpoint";
import River from "./generator/fields/river";
import JSONValidation from "./JSONValidation";
import AStar from "./generator/helper/AStar";

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

describe("start values unchanged", () => {

    test("no start values equal to default after generation", () => {
        const {startValues, json} = Board.generateRandom();
        expect(startValues).toStrictEqual(defaultStartValues);
        expect(new JSONValidation(json).valid()).toBe(true);
    });

    test("start values equal after generation", () => {
        const {startValues, json} = Board.generateRandom(_startValues);
        expect(startValues).toStrictEqual(_startValues);
        expect(new JSONValidation(json).valid()).toBe(true);
    });
})

describe("calculations", () => {

    test("free space count", () => {
        const generator = Board.generateRandom({rivers: false});
        expect(generator.getFreeFieldsCount()).toBe(0);
        expect(new JSONValidation(generator.json).valid()).toBe(true);
    });

    test("board dimensions", () => {
        const {board, json} = Board.generateRandom();
        expect(board.length).toBe(defaultStartValues.height);
        expect(board[0].length).toBe(defaultStartValues.width);
        expect(new JSONValidation(json).valid()).toBe(true);
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

    test("probability", () => {
        const chance = (2 / (2 ** 3));
        let counter = 0;
        const runs = 100000;
        for (let i = 0; i < runs; i++) {
            counter += BoardGenerator.probably(chance * 100) ? 1 : 0;
        }
        expect(counter / runs).toBeCloseTo(chance, 0.0001);
    })
})

describe("a-star", () => {
    test("max walls on 3x3 a-start test", () => {
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
        expect(AStar.pathPossible(checkpoints, startFields, board, walls)).toBe(true);
    });
    test("a-star algorithm", () => {
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
        expect(AStar.pathPossible(checkpoints, startFields, board, walls)).toBe(true);

    })
})
describe("wall generation", () => {
    test("walls", () => {
        const startValuesSmall: RandomBoardInterface = {
            checkpoints: 4,
            height: 16,
            lembasFields: 8,
            maxLembasAmountOnField: 3,
            lembasAmountExactMaximum: false,
            rivers: true,
            startFields: 6,
            width: 16,
            holes: 8,
            walls: true,
            riverAlgorithm: "default",
            name: "Small Board"
        };

        const generator = Board.generateRandom(startValuesSmall, null, false);
        expect(generator.walls.length).toBeGreaterThanOrEqual(0)
        const generatorD = Board.generateRandom(startValuesSmall, null, true);
        expect(generatorD.walls.length).toBeGreaterThanOrEqual(0)
    })
})

describe("board generation", () => {
    test("default board", () => {
        const generator = Board.generateRandom();
        const {startValues} = generator;
        expect(startValues).toStrictEqual(defaultStartValues);
        expect(generator.getFreeFieldsCount()).toBe(0);
        expect(new JSONValidation(generator.json).valid()).toBe(true);
    });

    test("giant board", () => {
        const generator = Board.generateRandom({
            checkpoints: 6,
            height: 64,
            lembasFields: 16,
            maxLembasAmountOnField: 3,
            lembasAmountExactMaximum: true,
            rivers: true,
            startFields: 6,
            width: 64,
            holes: 10,
            walls: false,
            riverAlgorithm: "default",
            name: "Giant Board"
        });
        expect(new JSONValidation(generator.json).valid()).toBe(true);
    });
})
describe("errors", () => {
    test("too small board", () => {
        expect(() => {
            Board.generateRandom({checkpoints: 3})
        }).toThrowError()
    });
})