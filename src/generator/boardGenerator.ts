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
    private readonly _percentage: number = 0.2;
    private readonly _board: Array<Array<FieldWithPositionInterface>>;
    private readonly _startValues: RandomBoardInterface;
    private readonly _json: Board;
    private _walls = 0;
    private _wallMapArray: Array<[string, boolean]>;

    private readonly _checkpoints: BoardPosition[]
    private readonly _startFields: BoardPosition[]
    private _wallCall: number;
    private _wallMaxCall: number;
    private _holesSet: number;
    private _holesTrys: Map<string, boolean>;
    private readonly _lembasFields: BoardPosition[];

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
        this._lembasFields = [];
        this._wallMapArray = [];


        if (this.getFieldCount() < this.getOccupiedFieldsCount()) {
            throw new Error("Board to small for all fields");
        }

        process.stdout.write(`\tGENERATING:BOARD_ARRAY\r`);
        let start = Date.now();
        this._board = this.generateBoardArray();
        process.stdout.write(`\tGENERATING:BOARD_ARRAY ✔️ ` + (Date.now() - start) + ` ms\n`);

        this._json = new Board(this._startValues.name, this._startValues.width, this._startValues.height);

        process.stdout.write(`\tGENERATING:SAURONS_EYE\r`)
        start = Date.now();
        this.genSauronsEye();
        process.stdout.write(`\tGENERATING:SAURONS_EYE ✔️ ` + (Date.now() - start) + ` ms\n`);

        process.stdout.write(`\tGENERATING:START_FIELDS\n`)
        start = Date.now();
        this.genStartFields();
        process.stdout.write(`\tGENERATING:START_FIELDS ✔️ ` + (Date.now() - start) + ` ms\n`);

        process.stdout.write(`\tGENERATING:CHECKPOINTS\r`)
        start = Date.now();
        this.genCheckpoints();
        process.stdout.write(`\tGENERATING:CHECKPOINTS ✔️ ` + (Date.now() - start) + ` ms\n`);

        if (this._startValues.lembasFields) {
            process.stdout.write(`\tGENERATING:LEMBAS_FIELDS\r`)
            start = Date.now();
            this.genLembasFields();
            process.stdout.write(`\tGENERATING:LEMBAS_FIELDS ✔️ ` + (Date.now() - start) + ` ms\n`);
        }

        if (this._startValues.holes) {
            process.stdout.write(`\tGENERATING:HOLES\n`)
            start = Date.now();
            this.genHoles();
            process.stdout.write(`\tGENERATING:HOLES ✔️ ` + (Date.now() - start) + ` ms\n`);
        }

        if (this._startValues.rivers && this.getFreeFieldsCount()) {
            process.stdout.write(`\tGENERATING:RIVERS\r`);
            start = Date.now();
            this.genRivers();
            process.stdout.write(`\tGENERATING:RIVERS ✔️ ` + (Date.now() - start) + ` ms\n`);
        }

        if (this._startValues.walls) {
            process.stdout.write(`\tGENERATING:WALLS\n`)
            start = Date.now();
            if (wallAlgo) {
                this.genWalls_David();
            } else {
                this.genWalls();
            }
            process.stdout.write(`\tGENERATING:WALLS ✔️ ` + (Date.now() - start) + ` ms\n`);

        }
        process.stdout.write(`\tGENERATING:DONE ✔️\n`);
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
        const todo = this._startValues.startFields;
        for (let i = 0; i < todo; i++) {
            this.genStartField();
            process.stdout.write("\t\t STARTFIELD " + i + "/" + todo + `\r`);
        }
        process.stdout.write("\t\t STARTFIELD " + todo + "/" + todo + `\n`);
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
        const maxTrys = this.getFieldCount() * 8;
        let trys = 0;
        this._holesSet = 0;
        this._holesTrys = new Map;
        while (this._holesSet < this._startValues.holes && trys < maxTrys) {
            process.stdout.write("\t\t HOLES: " + this._holesSet + " TRY " + trys + "/" + maxTrys + "\r");
            this.genHole();
            trys++;
        }
        process.stdout.write("\t\t HOLES: " + this._holesSet + " TRY " + trys + "/" + maxTrys + "\n");

    }

    private genHole() {
        const position = this.getRandomPosition();
        if (this._holesTrys.get(this.position2String(position)) == undefined) {
            const {result} = AStar.pathPossible(this._checkpoints, this._startFields, this._lembasFields, this._board, new Map([]));
            if (result) {
                this._board[position.y][position.x] = new Hole(position);
                this._json.addHole(position);
                this._holesSet++;
            }
            this._holesTrys.set(this.position2String(position), true);
        }
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
        this._lembasFields.push(position);
        this._json.addLembasField(position, amount);
    }

    private genRivers() {

        const freeSpacesCount = this.getFreeFieldsCount();
        let riverFieldCount = Math.floor(freeSpacesCount / 5);

        // on max=1, riverFieldCount could be bigger than 1
        if (riverFieldCount > freeSpacesCount) {
            riverFieldCount = freeSpacesCount;
        }

        if (this._startValues.riverAlgorithm == "default") {
            this.genRiversDefault(riverFieldCount);
        } else {
            // DONE: complex river generation
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

    private msToTime(duration) {
        const milliseconds = Math.floor((duration % 1000) / 100)
        let seconds: string | number = Math.floor((duration / 1000) % 60),
            minutes: string | number = Math.floor((duration / (1000 * 60)) % 60),
            hours: string | number = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }

    private async genWalls() {
        const x = this._startValues.width;
        const y = this._startValues.height;
        const wallsToSet = Math.floor((((x - 1) * y) + ((y - 1) * x)) * this._percentage);
        const alreadyTried: Array<string> = []

        this._wallMaxCall = (((x - 1) * y) + ((y - 1) * x)) * 4;
        this._wallCall = 0;
        let pathFindings = 0;
        if (wallsToSet) {
            let absTime = 0;
            let time = 0;
            while (this._wallCall < this._wallMaxCall && this._walls < wallsToSet) {
                process.stdout.write("\t\t WALL:RUN " + this._walls + `/` + wallsToSet + " WALLS (PATHFINDINGS: " + pathFindings + ") ~ " + this.msToTime(absTime) + `/` + this.msToTime(time * wallsToSet) + `         \r`);
                const start = Date.now();
                pathFindings += this.genWall(alreadyTried);
                time = Date.now() - start
                absTime += time;
                this._wallCall++;
            }
            process.stdout.write("\t\t WALL:TRY " + this._walls + `/` + wallsToSet + " WALLS (PATHFINDINGS: " + pathFindings + ")" + `\n`);
        }

    }

    private genWall(alreadyTried: Array<string>): number {

        let pathFindings = 0;
        const firstPosition = this.getRandomPosition(true);
        const neighbors = this.getNeighbors(firstPosition);
        if (neighbors.length) {
            const secondPosition = neighbors[this.getRandomInt(0, neighbors.length)]
            if (!alreadyTried.includes(firstPosition.x.toString() + firstPosition.y.toString() + secondPosition.x.toString() + secondPosition.y) && !alreadyTried.includes(secondPosition.x.toString() + secondPosition.y.toString() + firstPosition.x.toString() + firstPosition.y)) {
                const _s1 = this.position2String(firstPosition) + this.position2String(secondPosition);
                const _s2 = this.position2String(secondPosition) + this.position2String(firstPosition);
                const wallsArrayCopy = [...this._wallMapArray];
                this._wallMapArray.push([_s1, true], [_s2, true]);
                const {
                        result,
                        pathFindings: p
                    } = AStar.pathPossible(this._checkpoints, this._startFields, this._lembasFields, this._board, new Map(this._wallMapArray)
                    )
                ;
                pathFindings += p;
                alreadyTried.push(_s1, _s2);
                if (result) {
                    this._walls++;
                    this._json.addWall([[firstPosition.x, firstPosition.y], [secondPosition.x, secondPosition.y]]);
                } else {
                    this._wallMapArray = wallsArrayCopy;
                }
            }

        }
        return pathFindings;
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
        let runs = 0;
        let pathFindings = 0;
        const fieldCount = this.getFieldCount();
        let absTime = 0;
        for (let y = 0; y < this._board.length; y++) {
            const row = this._board[y];
            for (let x = 0; x < row.length; x++) {
                const field = row[x];
                const start = Date.now();
                process.stdout.write("\t\t WALL:RUN " + (runs + 1) + `/` + fieldCount + " WALLS (PATHFINDINGS: " + pathFindings + ") ~ " + this.msToTime(absTime) + `/` + this.msToTime((absTime / (runs + 1)) * fieldCount) + `         \r`);
                pathFindings = this.genWall_David(field.position, pathFindings);
                absTime += Date.now() - start;
                runs++;

            }
        }
        process.stdout.write("\t\t WALL:RUN " + fieldCount + `/` + fieldCount + " RUNS (PATHFINDINGS: " + pathFindings + ")" + `\n`);
    }

    private genWall_David(position: BoardPosition, pathFindings: number): number {

        const neighbors = this.getNeighbors_David(position);
        for (const neighborsKey in neighbors) {
            if (BoardGenerator.probably((this._percentage * 100))) {
                const neighbor = neighbors[neighborsKey];
                const _s1 = this.position2String(position) + this.position2String(neighbor);
                const _s2 = this.position2String(neighbor) + this.position2String(position);
                const wallsArrayCopy = [...this._wallMapArray];
                this._wallMapArray.push([_s1, true], [_s2, true]);
                const {
                    result: pathPossible,
                    pathFindings: p
                } = AStar.pathPossible(this._checkpoints, this._startFields, this._lembasFields, this._board, new Map(this._wallMapArray));
                pathFindings += p;
                if (!pathPossible) {
                    this._wallMapArray = wallsArrayCopy;
                } else {
                    this._walls++;
                    this._wallMapArray.push([_s1, true], [_s2, true]);
                    this._json.addWall([[position.x, position.y], [neighbor.x, neighbor.y]]);
                }
            }
        }
        return pathFindings;


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

    private position2String(postion: BoardPosition): string {
        return postion.x.toString() + postion.y.toString();
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

    public wallCount(): number {
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

    static sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

export default BoardGenerator;
