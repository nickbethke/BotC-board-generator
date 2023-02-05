import Grass from "./fields/grass";
import BoardConfigInterface, {Direction, DirectionEnum} from "../interfaces/boardConfigInterface";
import SauronsEye from "./fields/sauronsEye";
import StartField from "./fields/startField";
import Checkpoint from "./fields/checkpoint";
import Hole from "./fields/hole";
import Lembas from "./fields/lembas";
import River from "./fields/river";
import Board from "./board";
import FieldWithPositionInterface from "../interfaces/fieldWithPositionInterface";
import AStar from "./helper/AStar";

const DirectionArrows: string[] = [
    '↑', '→', '↓', '←'
];

export interface RandomBoardInterface {
    name?: string;
    width?: number;
    height?: number;
    startFields?: number;
    checkpoints?: number;
    lembasFields?: number;
    maxLembasAmountOnField?: number;
    lembasAmountExactMaximum?: boolean;
    rivers?: boolean;
    holes?: number;
    walls?: boolean;
    riverAlgorithm?: RiverAlgorithm
}

export type RiverAlgorithm = "default" | "complex"

export const defaultStartValues: RandomBoardInterface = {
    name: "THE CENTERLÄND",
    checkpoints: 1,
    height: 2,
    width: 2,
    lembasFields: 0,
    maxLembasAmountOnField: 0,
    lembasAmountExactMaximum: true,
    rivers: false,
    startFields: 2,
    holes: 0,
    walls: false,
    riverAlgorithm: "default"
};

export type BoardPosition = {
    x: number

    y: number
}

class BoardGenerator {
    private readonly _board: Array<Array<FieldWithPositionInterface>>;
    private readonly _startValues: RandomBoardInterface;
    private readonly _json: Board;
    private _walls: Array<[[number, number], [number, number]]>;

    private readonly _checkpoints: BoardPosition[]
    private readonly _startFields: BoardPosition[]
    private _wallCall: number;
    private _wallMaxCall: number;

    /**
     * @throws {Error}
     * @param startValues
     * @param _callback
     * @param wallAlgo
     */
    constructor(startValues?: RandomBoardInterface, _callback?: () => void, wallAlgo = false) {

        // TODO: start values validation...?!

        this._startValues = {...defaultStartValues, ...startValues};

        this._checkpoints = [];
        this._startFields = [];


        if (this.getFieldCount() < this.getOccupiedFieldsCount()) {
            throw new Error("Board to small for all fields");
        }

        if (this.getFieldCount() > 2 ** 10 && this._startValues.walls) {
            // this._startValues.walls = false;
            // console.log(`! Walls generation has been disabled due to large board size (` + this._startValues.width + "x" + this._startValues.height + `)`);
        }

        this._board = this.generateBoardArray();
        this._walls = [];

        this._json = new Board(this._startValues.name, this._startValues.width, this._startValues.height);

        if (this._startValues.rivers && this.getFreeFieldsCount()) {
            this.genRivers();
        }

        this.genSauronsEye();

        this.genStartFields();

        this.genCheckpoints();

        if (this._startValues.holes) {
            this.genHoles();
        }

        if (this._startValues.lembasFields) {
            this.genLembasFields();
        }


        if (this._startValues.walls) {
            if (wallAlgo) {
                this.genWalls_David();
            } else {
                this.genWalls();
            }

        }

        if (_callback) _callback();

    }

    private generateBoardArray(): Array<Array<FieldWithPositionInterface>> {
        const board = new Array<Array<FieldWithPositionInterface>>();

        for (let y = 0; y < this._startValues.height; y++) {
            const row: FieldWithPositionInterface[] = new Array<FieldWithPositionInterface>();
            for (let x = 0; x < this._startValues.width; x++) {
                row.push(new Grass({x, y}));
            }
            board.push(row);
        }
        return board;
    }

    private genSauronsEye() {
        const position = this.getRandomPosition();
        const direction = this.getRandomDirection();
        this._board[position.y][position.x] = new SauronsEye(position, direction);
        this._json.setEye(position, direction)
    }

    private genStartFields() {
        for (let i = 0; i < this._startValues.startFields; i++) {
            this.genStartField();
        }
    }

    private genStartField() {
        const position = this.getRandomPosition();
        const direction = this.getRandomDirection();
        this._board[position.y][position.x] = new StartField(position, direction);
        this._json.addStartField(position, direction)
        this._startFields.push(position);
    }

    private genCheckpoints() {
        for (let i = 0; i < this._startValues.checkpoints; i++) {
            this.genCheckpoint(i);
        }
    }

    private genCheckpoint(order: number) {
        const position = this.getRandomPosition();
        this._board[position.y][position.x] = new Checkpoint(position, order);
        this._json.addCheckPoint(position);
        this._checkpoints.push(position);
    }

    private genHoles() {
        for (let i = 0; i < this._startValues.holes; i++) {
            this.genHole();
        }

    }

    private genHole() {
        const position = this.getRandomPosition();
        this._board[position.y][position.x] = new Hole(position);
        this._json.addHole(position);
    }

    private genLembasFields() {
        for (let i = 0; i < this._startValues.lembasFields; i++) {
            this.genLembasField();
        }
    }

    private genLembasField() {
        const position = this.getRandomPosition();
        const amount = this._startValues.lembasAmountExactMaximum ? this._startValues.maxLembasAmountOnField : this.getRandomLembasAmount();
        this._board[position.y][position.x] = new Lembas(position, amount);
        this._json.addLembasField(position, amount);
    }

    private genRivers() {

        const freeSpacesCount = this.getFreeFieldsCount();
        const max = Math.floor(freeSpacesCount / 3);
        let riverFieldCount = max <= 1 ? 1 : this.getRandomIntInclusive(1, max);

        // on max=1, riverFieldCount could be bigger than 1
        if (riverFieldCount > freeSpacesCount) {
            riverFieldCount = freeSpacesCount;
        }

        if (this._startValues.riverAlgorithm == "default") {
            this.genRiversDefault(riverFieldCount);
        } else {
            // TODO: complex river generation
            this.genRiversComplex(riverFieldCount);
        }
    }

    /**
     * Placing totally random river fields on the board.
     * @param riverCount
     * @private
     */
    private genRiversDefault(riverCount: number) {
        for (let i = 0; i < riverCount; i++) {
            const position = this.getRandomPosition();
            const direction = this.getRandomDirection();
            this._board[position.y][position.x] = new River(position, direction);
            this._json.addRiverField(position, direction);
        }
    }

    /**
     * Placing river fields more natural on the board.
     * @param riverCount
     * @private
     */
    private genRiversComplex(riverCount: number) {
        let done = false;
        let made = 0;
        while (!done) {
            const toMake = this.getRandomInt(2, Math.min(this._startValues.height, this._startValues.width));
            let startPosition = this.getRandomPosition();
            let startDirection = this.getRandomDirection();

            this._board[startPosition.y][startPosition.x] = new River(startPosition, startDirection);
            this._json.addRiverField(startPosition, startDirection);

            for (let i = 1; i < toMake; i++) {
                const neighbors = this.getRiverNeighbors(startPosition);
                if (neighbors.length > 0) {
                    let selected: { position: BoardPosition, direction: Direction } = null;
                    const helpDirection = this.dirEnumToString(startDirection);
                    for (const neighborsKey in neighbors) {
                        const {direction} = neighbors[neighborsKey];
                        if (direction == helpDirection) {
                            selected = neighbors[neighborsKey];
                            break;
                        }
                    }
                    if (selected == null) {
                        break;
                    } else {
                        startDirection = this.getRandomDirection();
                        if (this.dirEnumToString(startDirection) == "SOUTH" && helpDirection == "NORTH" || this.dirEnumToString(startDirection) == "NORTH" && helpDirection == "SOUTH") {
                            startDirection = BoardGenerator.probably(50) ? DirectionEnum.EAST : DirectionEnum.WEST;
                        }
                        if (this.dirEnumToString(startDirection) == "EAST" && helpDirection == "WEST" || this.dirEnumToString(startDirection) == "WEST" && helpDirection == "EAST") {
                            startDirection = BoardGenerator.probably(50) ? DirectionEnum.NORTH : DirectionEnum.SOUTH;
                        }
                        startPosition = selected.position;
                        this._board[startPosition.y][startPosition.x] = new River(startPosition, startDirection);
                        this._json.addRiverField(startPosition, startDirection);
                        made++;
                        if (made >= riverCount) {
                            break;
                        }
                        continue;
                    }
                }
                break;
            }
            if (made >= riverCount) {
                done = true;
            }

        }
    }

    public dirEnumToString(direction: DirectionEnum): Direction {
        return DirectionEnum[direction] as Direction;
    }

    public getRiverNeighbors(position: BoardPosition): Array<{ position: BoardPosition, direction: Direction }> {
        const {x, y} = position;

        const neighbors = new Array<{ position: BoardPosition, direction: Direction }>();
        //north
        let currentPosition = {x: x, y: y - 1};
        if (this.isPositionInBoard(currentPosition) && !(this._board[y][x] instanceof River)) {
            neighbors.push({position: currentPosition, direction: "NORTH"});
        }

        //east
        currentPosition = {x: x + 1, y: y};
        if (this.isPositionInBoard(currentPosition) && (this._board[y][x] instanceof River)) {
            neighbors.push({position: currentPosition, direction: "EAST"});
        }
        //south
        currentPosition = {x: x, y: y + 1};
        if (this.isPositionInBoard(currentPosition) && (this._board[y][x] instanceof River)) {
            neighbors.push({position: currentPosition, direction: "SOUTH"});
        }

        //west
        currentPosition = {x: x - 1, y: y};
        if (this.isPositionInBoard(currentPosition) && (this._board[y][x] instanceof River)) {
            neighbors.push({position: currentPosition, direction: "WEST"});
        }

        return neighbors;
    }

    private genWalls() {
        const x = this._startValues.width;
        const y = this._startValues.height;
        const max = (((x - 1) * y) + ((y - 1) * x)) / 4;
        const wallsToSet = this.getRandomIntInclusive(1, max);
        //console.log("MAX WALLS", max, "TO BE SET", wallsToSet);
        const alreadyTried: Array<string> = []

        this._wallMaxCall = (((x - 1) * y) + ((y - 1) * x)) * 4;
        this._wallMaxCall = this._wallMaxCall > 1024 ? 1024 : this._wallMaxCall;
        this._wallCall = 0;
        if (wallsToSet)
            this.genWall(wallsToSet, 0, alreadyTried);

    }

    private genWall(until: number, current: number, alreadyTried: Array<string>) {
        if (this._wallCall < this._wallMaxCall) {

            this._wallCall++;
            const firstPosition = this.getRandomPosition(true);
            const neighbors = this.getNeighbors(firstPosition);
            if (neighbors.length) {
                const secondPosition = neighbors[this.getRandomInt(0, neighbors.length)]
                //console.log(" > WALL TRY ", firstPosition, secondPosition, "\r");
                if (!alreadyTried.includes(firstPosition.x.toString() + firstPosition.y.toString() + secondPosition.x.toString() + secondPosition.y) && !alreadyTried.includes(secondPosition.x.toString() + secondPosition.y.toString() + firstPosition.x.toString() + firstPosition.y)) {
                    const wallsCopy = [...this._walls];
                    this._walls.push([[firstPosition.x, firstPosition.y], [secondPosition.x, secondPosition.y]])
                    const pathPossible = AStar.pathPossible(this._checkpoints, this._startFields, this._board, this._walls);

                    alreadyTried.push(firstPosition.x.toString() + firstPosition.y.toString() + secondPosition.x.toString() + secondPosition.y);
                    alreadyTried.push(secondPosition.x.toString() + secondPosition.y.toString() + firstPosition.x.toString() + firstPosition.y);
                    //console.log(alreadyTried);
                    if (pathPossible) {
                        current++;
                        this._json.addWall([[firstPosition.x, firstPosition.y], [secondPosition.x, secondPosition.y]]);
                        //console.log(" > New Wall", [[firstPosition.x, firstPosition.y], [secondPosition.x, secondPosition.y]], "\r");
                        if (current < until) {
                            this.genWall(until, current, alreadyTried);
                        }

                    } else {
                        this._walls = wallsCopy;
                        // console.log(" > ERROR Wall");
                        if (current < until) {
                            this.genWall(until, current, alreadyTried);
                        }
                    }
                } else if (current < until) {
                    this.genWall(until, current, alreadyTried);
                }
            }
        }
    }


    public getNeighbors(position: BoardPosition): Array<BoardPosition> {
        const {x, y} = position;

        const neighbors = new Array<BoardPosition>();
        //north
        let currentPosition = {x: x, y: y - 1};
        if (this.isPositionInBoard(currentPosition)) {
            neighbors.push(currentPosition);
        }

        //east
        currentPosition = {x: x + 1, y: y};
        if (this.isPositionInBoard(currentPosition)) {
            neighbors.push(currentPosition);
        }
        //south
        currentPosition = {x: x, y: y + 1};
        if (this.isPositionInBoard(currentPosition)) {
            neighbors.push(currentPosition);
        }

        //west
        currentPosition = {x: x - 1, y: y};
        if (this.isPositionInBoard(currentPosition)) {
            neighbors.push(currentPosition);
        }

        return neighbors;
    }

    private genWalls_David(): void {
        for (let y = 0; y < this._board.length; y++) {
            const row = this._board[y];
            for (let x = 0; x < row.length; x++) {
                const field = row[x];
                this.genWall_David(field.position);

            }
        }
    }

    private genWall_David(position: BoardPosition): void {

        const neighbors = this.getNeighbors_David(position);
        //console.log("CURRENT FIELD", position, "NEIGHBORS", neighbors)
        for (const neighborsKey in neighbors) {
            if (BoardGenerator.probably(20)) {
                const neighbor = neighbors[neighborsKey];
                const wallsCopy = [...this._walls];
                this._walls.push([[position.x, position.y], [neighbor.x, neighbor.y]])
                const pathPossible = AStar.pathPossible(this._checkpoints, this._startFields, this._board, this._walls);
                if (!pathPossible) {
                    // console.log(" > WALL ERROR", position, neighbor);
                    this._walls = wallsCopy;
                } else {
                    //console.log(" > NEW WALL", position, neighbor);
                    this._json.addWall([[position.x, position.y], [neighbor.x, neighbor.y]]);
                }
            }
        }


    }

    public static probably(percentage: number): boolean {
        const zeroToOne = Math.random(); // greater than or equal to 0.0 and less than 1.0
        const multiple = zeroToOne * 100; // greater than or equal to 0.0 and less than 100.0
        return multiple < percentage;
    }

    private getNeighbors_David(position: BoardPosition): Array<BoardPosition> {
        const {x, y} = position;

        const neighbors = new Array<BoardPosition>();
        //east
        let currentPosition = {x: x + 1, y: y};
        if (this.isPositionInBoard(currentPosition)) {
            neighbors.push(currentPosition);
        }
        //south
        currentPosition = {x: x, y: y + 1};
        if (this.isPositionInBoard(currentPosition)) {
            neighbors.push(currentPosition);
        }
        return neighbors;
    }

    private isPositionInBoard(position: BoardPosition): boolean {
        const {x, y} = position;
        if (x > (this._startValues.width - 1) || x < 0) {
            return false;
        }
        return !(y > (this._startValues.height - 1) || y < 0);

    }


    private getFieldCount(): number {
        return this._startValues.width * this._startValues.height;
    }

    public getFreeFieldsCount(): number {
        return this.getFieldCount() - this.getOccupiedFieldsCount();
    }

    public getOccupiedFieldsCount(): number {
        return this._startValues.holes + this._startValues.startFields + this._startValues.lembasFields + this._startValues.checkpoints + 1;
    }

    private getRandomPosition(ignoreOccupiedFields = false): BoardPosition {
        const x = this.getRandomInt(0, this._startValues.width);
        const y = this.getRandomInt(0, this._startValues.height);
        if (ignoreOccupiedFields) {
            return {x, y};
        } else {
            return this.isFieldFree({x, y}) ? {x, y} : this.getRandomPosition();
        }
    }

    private isFieldFree(position: BoardPosition): boolean {
        return this._board[position.y][position.x] instanceof Grass;
    }

    private getRandomDirection(): DirectionEnum {
        return this.getRandomEnum(DirectionEnum);
    }

    private getRandomEnum<T>(anEnum: T): T[keyof T] {
        const enumValues = Object.keys(anEnum)
            .map(n => Number.parseInt(n))
            .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
        const randomIndex = Math.floor(Math.random() * enumValues.length)
        return enumValues[randomIndex];
    }

    private getRandomLembasAmount(): number {
        return this._startValues.maxLembasAmountOnField <= 0 ? 0 : this.getRandomIntInclusive(0, this._startValues.maxLembasAmountOnField);
    }

    private getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }

    private getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    get board(): Array<Array<FieldWithPositionInterface>> {
        return this._board;
    }

    get json(): BoardConfigInterface {
        return JSON.parse(JSON.stringify(this._json));
    }

    get startValues(): RandomBoardInterface {
        return this._startValues;
    }

    get walls(): Array<[[number, number], [number, number]]> {
        return this._walls;
    }

    static printRandomGeneratorBoard(board: Array<Array<FieldWithPositionInterface>>): string {
        const outputArray: string[] = [];
        const repeat = 14;
        outputArray.push(("|" + "-".repeat(repeat + 2)).repeat(board[0].length) + "|\n");
        for (let y = 0; y < board.length; y++) {
            const row: FieldWithPositionInterface[] = board[y];
            outputArray.push("| ");
            for (let x = 0; x < row.length; x++) {
                const item = row[x];
                if (item instanceof SauronsEye || item instanceof StartField || item instanceof River) {
                    outputArray.push((item.constructor.name + " " + DirectionArrows[item.direction]).padEnd(repeat, " ") + " | ");
                } else if (item instanceof Lembas) {
                    outputArray.push((item.constructor.name + ":" + item.amount).padEnd(repeat, " ") + " | ");
                } else if (item instanceof Checkpoint) {
                    outputArray.push((item.constructor.name + ":" + item.order).padEnd(repeat, " ") + " | ");
                } else {
                    outputArray.push(item.constructor.name.padEnd(repeat, " ") + " | ");
                }
            }
            outputArray.push("\n" + ("|" + "-".repeat(repeat + 2)).repeat(row.length) + "|\n");
        }
        return outputArray.join("");
    }

    static firstLetter(string: string): string {
        return string.substring(0, 1);
    }
}

export default BoardGenerator;
