import FieldWithPositionInterface from "../../interfaces/fieldWithPositionInterface";
import {BoardPosition} from "../boardGenerator";
import SauronsEye from "../fields/sauronsEye";


class PathFinder {
    private readonly _board: Array<Array<FieldWithPositionInterface>>;
    private _walls: Array<[[number, number], [number, number]]>;
    private readonly _width: number;
    private readonly _height: number;
    private _checkpoints: Array<BoardPosition>;
    private _startFields: Array<BoardPosition>;

    constructor(board: Array<Array<FieldWithPositionInterface>>, walls: Array<[[number, number], [number, number]]>, width: number, height: number, checkpoints: Array<BoardPosition>, startFields: Array<BoardPosition>) {
        this._board = board;
        this._walls = walls;
        this._width = width;
        this._height = height;
        this._checkpoints = checkpoints;
        this._startFields = startFields;
    }

    /**
     * return true if all paths are possible
     * @return boolean
     */
    check(): boolean {
        const ret = new Array<boolean>();
        this._startFields.forEach((startFieldPosition) => {
            this._checkpoints.forEach((checkpointPosition) => {
                const walked: BoardPosition[] = [];
                const result = this.findPath(walked, startFieldPosition, checkpointPosition);
                //console.log("RESULT", result);
                ret.push(result);
            })
        })
        //console.log("TEST", ret);
        if (ret.indexOf(false) !== -1) {
            return false;
        } else {
            return true;
        }

    }

    private findPath(walked: BoardPosition[], startPosition: BoardPosition, endPosition: BoardPosition): boolean {


        //console.log("START", startPosition, "END", endPosition);
        if (this.positionsEqual(startPosition, endPosition)) {
            return true;
        }
        const neighbors = this.getNeighbors(startPosition);

        const {x, y} = startPosition;

        const potentialNeighbors = [
            {x: x, y: y + 1},
            {x: x, y: y - 1},
            {x: x + 1, y: y},
            {x: x - 1, y: y},
        ]

        //console.log("NEIGHBORS", neighbors, "POTENTIAL", potentialNeighbors);

        for (const neighborsKey in neighbors) {
            const n = neighbors[neighborsKey];
            if (this.positionsEqual(endPosition, n)) {
                return true;
            }
        }
        walked.push(startPosition);
        for (const neighborsKey in neighbors) {
            const n = neighbors[neighborsKey];
            if (!this.containsPosition(n, walked)) {
                //console.log("GOING TO", n);
                const result = this.findPath(walked, n, endPosition);
                if (!result) {
                    continue;
                } else {
                    return result;
                }
            } else {
                continue;
            }
        }
        return false;
    }

    private containsPosition(search: BoardPosition, haystack: BoardPosition[]) {
        let i;
        for (i = 0; i < haystack.length; i++) {
            if (this.positionsEqual(search, haystack[i])) {
                return true;
            }
        }

        return false;
    }

    private positionsEqual(position: BoardPosition, neighborPosition: BoardPosition): boolean {
        return (position.x == neighborPosition.x && position.y == neighborPosition.y);
    }

    public getNeighbors(position: BoardPosition): Array<BoardPosition> {
        const {x, y} = position;

        const neighbors = new Array<BoardPosition>();
        //north
        let currentPosition = {x: x, y: y - 1};
        if (this.isPositionInBoard(currentPosition)) {
            const northField = this._board[y - 1][x];
            if (!(northField instanceof SauronsEye) && !this.wallBetweenFields(position, currentPosition)) {
                neighbors.push(currentPosition);
            }
        }

        //east
        currentPosition = {x: x + 1, y: y};
        if (this.isPositionInBoard(currentPosition)) {
            const eastField = this._board[y][x + 1];
            if (!(eastField instanceof SauronsEye) && !this.wallBetweenFields(position, currentPosition)) {
                neighbors.push(currentPosition);
            }
        }
        //south
        currentPosition = {x: x, y: y + 1};
        if (this.isPositionInBoard(currentPosition)) {
            const southField = this._board[y + 1][x];
            if (!(southField instanceof SauronsEye) && !this.wallBetweenFields(position, currentPosition)) {
                neighbors.push(currentPosition);
            }
        }

        //west
        currentPosition = {x: x - 1, y: y};
        if (this.isPositionInBoard(currentPosition)) {
            const westField = this._board[y][x - 1];
            if (!(westField instanceof SauronsEye) && !this.wallBetweenFields(position, currentPosition)) {
                neighbors.push(currentPosition);
            }
        }

        return neighbors;
    }

    private isPositionInBoard(position: BoardPosition): boolean {
        const {x, y} = position;
        if (x > (this._width - 1) || x < 0) {
            return false;
        }
        if (y > (this._height - 1) || y < 0) {
            return false;
        }
        return true;
    }

    private wallBetweenFields(position: BoardPosition, neighborPosition: BoardPosition): boolean {
        const _x1 = position.x;
        const _x2 = neighborPosition.x;
        const _y1 = position.y;
        const _y2 = neighborPosition.y;
        let wall = false;
        for (const wallsKey in this._walls) {
            const w = this._walls[wallsKey];

            const wallString1 = w[0].join("") + w[1].join("");
            const wallString2 = w[1].join("") + w[0].join("");

            const positionString = _x1.toString() + _y1.toString() + _x2.toString() + _y2.toString()

            if (positionString == wallString1 || positionString == wallString2) {
                wall = true;
            }
            if (wall) {
                break;
            }
        }
        return wall;
    }
}

export default PathFinder;