import BoardConfigInterface, {
    Direction,
    DirectionEnum,
    Lembas,
    Position,
    PositionDirection,
} from "../interfaces/boardConfigInterface";
import BoardGenerator, {BoardPosition, RandomBoardInterface} from "./boardGenerator";

class Board implements BoardConfigInterface {
    checkPoints: Position[];
    eye: PositionDirection;
    height: number;
    holes?: Position[];
    lembas?: Lembas[];
    name: string;
    riverFields?: PositionDirection[];
    startFields: PositionDirection[];
    walls?: Position[][];
    width: number;

    constructor(name: string, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.name = name;
    }

    public addCheckPoint(position: BoardPosition) {
        const {x, y} = position;
        if (this.checkPoints === undefined) {
            this.checkPoints = [];
        }
        this.checkPoints.push([x, y]);
    }

    public dirEnumToString(direction: DirectionEnum): Direction {
        return DirectionEnum[direction] as Direction;
    }

    public addStartField(position: BoardPosition, direction: DirectionEnum) {
        const {x, y} = position;
        if (this.startFields === undefined) {
            this.startFields = [];
        }
        this.startFields.push({
            position: [x, y],
            direction: this.dirEnumToString(direction)
        });
    }

    public setEye(position: BoardPosition, direction: DirectionEnum) {
        const {x, y} = position;
        this.eye = {
            position: [x, y],
            direction: this.dirEnumToString(direction)
        }
    }

    public addHole(position: BoardPosition) {
        const {x, y} = position;
        if (this.holes === undefined) {
            this.holes = [];
        }
        this.holes.push([x, y]);
    }

    public addLembasField(position: BoardPosition, amount: number) {
        const {x, y} = position;
        if (this.lembas === undefined) {
            this.lembas = [];
        }
        this.lembas.push({position: [x, y], amount});
    }

    public addRiverField(position: BoardPosition, direction: DirectionEnum) {
        const {x, y} = position;
        if (this.riverFields === undefined) {
            this.riverFields = [];
        }
        this.riverFields.push({
            position: [x, y],
            direction: this.dirEnumToString(direction)
        });
    }

    public addWall(position: [[number, number], [number, number]]) {
        if (this.walls === undefined) {
            this.walls = [];
        }
        this.walls.push(position);
    }

    public getWallCount(): number {
        return this.walls.length;
    }

    static generateRandom(startValues?: RandomBoardInterface, _callback?: () => void, wallAlgo = false): BoardGenerator {
        return new BoardGenerator(startValues, _callback, wallAlgo);
    }
}

export default Board;
