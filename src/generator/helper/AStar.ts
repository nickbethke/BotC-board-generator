import FieldWithPositionInterface from "../../interfaces/fieldWithPositionInterface";
import SauronsEye from "../fields/sauronsEye";
import {BoardPosition} from "../boardGenerator";


export type AStarElement = {
    state: BoardPosition,
    cost: number,
    estimate: number
}

class AStar {
    private readonly _start: BoardPosition;
    private readonly _goal: BoardPosition;
    private readonly _board: Array<Array<FieldWithPositionInterface>>;

    private readonly _walls: Array<[[number, number], [number, number]]>;

    constructor(start: BoardPosition, goal: BoardPosition, board: Array<Array<FieldWithPositionInterface>>, walls: Array<[[number, number], [number, number]]>) {
        this._start = start
        this._goal = goal;
        this._board = board;
        this._walls = walls;
    }

    AStar(): Array<{ state: { x: number, y: number }, cost: number, estimate: number }> {
        const explored: AStarElement[] = [];

        const frontier: AStarElement[] = [{
            state: this._start,
            cost: 0,
            estimate: this.heuristic(this._start)
        }];

        while (frontier.length > 0) {
            frontier.sort(function (a, b) {
                return a.estimate - b.estimate;
            });

            const node = frontier.shift();

            explored.push(node);

            // If this nodereaches the goal, return thenode
            if (node.state.x == this._goal.x && node.state.y == this._goal.y) {
                return explored
            }
            // Generate the possible next steps from this node's state
            const next = this.generateNextSteps(node.state);
            //console.log("GOTO", node.state, "NEIGHBORS", next);

            // For each possible next step
            for (let i = 0; i < next.length; i++) {
                // Calculate the cost of the next step by adding the step's cost to the node's cost
                const step = next[i];
                const cost = step.cost + node.cost;

                // Check if this step has already been explored
                const isExplored = (explored.find(e => {
                    return e.state.x == step.state.x &&
                        e.state.y == step.state.y
                }))

                //avoid repeated nodes during the calculation of neighbors
                const isFrontier = (frontier.find(e => {
                    return e.state.x == step.state.x &&
                        e.state.y == step.state.y
                }))


                // If this step has not been explored
                if (!isExplored && !isFrontier) {
                    // Add the step to the frontier, using the cost and the heuristic function to estimate the total cost to reach the goal
                    frontier.push({
                        state: step.state,
                        cost: cost,
                        estimate: cost + this.heuristic(step.state)
                    });
                }
            }
        }
        return [];
    }

    heuristic(state: BoardPosition): number {
        const dx = Math.abs(state.x - this._goal.x);
        const dy = Math.abs(state.y - this._goal.y);

        const penalty = this.pathIntersectsObstacle(state, this._goal) * 10

        return Math.sqrt(dx * dx + dy * dy) + penalty;
    }

    generateNextSteps(state) {
        // Define an array to store the next steps
        const height = this._board.length;
        const width = this._board[0].length;

        const next = [];

        // Check if the current state has any valid neighbors
        if (state.x > 0) {
            // If the current state has a neighbor to the left, add it to the array of next steps
            const neighbor = {x: state.x - 1, y: state.y};
            //console.log("NEIGHBOR?", state, neighbor);
            if (!this.isObstacle(state.x - 1, state.y) && !this.isWallBetween(state, neighbor)) {
                next.push({
                    state: {x: state.x - 1, y: state.y},
                    cost: 1
                });
            }
        }
        if (state.x < width - 1) {
            // If the current state has a neighbor to the right, add it to the array of next steps
            const neighbor = {x: state.x + 1, y: state.y};
            //console.log("NEIGHBOR?", state, neighbor);
            if (!this.isObstacle(state.x + 1, state.y) && !this.isWallBetween(state, neighbor)) {
                next.push({
                    state: {x: state.x + 1, y: state.y},
                    cost: 1
                });
            }
        }
        if (state.y > 0) {
            // If the current state has a neighbor above it, add it to the array of next steps
            const neighbor = {x: state.x, y: state.y - 1};
            //console.log("NEIGHBOR?", state, neighbor);
            if (!this.isObstacle(state.x, state.y - 1) && !this.isWallBetween(state, neighbor)) {
                next.push({
                    state: {x: state.x, y: state.y - 1},
                    cost: 1
                });
            }
        }
        if (state.y < height - 1) {
            // If the current state has a neighbor below it, add it to the array of next steps
            const neighbor = {x: state.x, y: state.y + 1};
            //console.log("NEIGHBOR?", state, neighbor);
            if (!this.isObstacle(state.x, state.y + 1) && !this.isWallBetween(state, neighbor)) {
                next.push({
                    state: {x: state.x, y: state.y + 1},
                    cost: 1
                });
            }
        }

        // Return the array of next steps
        return next;
    }

    isObstacle(x, y) {
        //console.log(" > SAURON?", this._board[y][x]);
        return this._board[y][x] instanceof SauronsEye;
    }

    isWallBetween(position1: BoardPosition, position2: BoardPosition) {
        const _x1 = position1.x;
        const _x2 = position2.x;
        const _y1 = position1.y;
        const _y2 = position2.y;
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
        //console.log(" > WALL?", position1, position2, wall);
        return wall;
    }

    pathIntersectsObstacle(start: BoardPosition, end: BoardPosition) {
        // Convert the starting and ending coordinates to grid coordinates
        const {x: startX, y: startY} = start;
        const {x: endX, y: endY} = end;

        // Get the coordinates of all points on the path
        const path: Array<[number, number]> = this.getPath(startX, startY, endX, endY);

        //get the points in the array that are within the list of obstacles

        let instersections = 0;

        for (const pathKey in path) {
            const point = path[pathKey];
            if (!(this._board[point[1]][point[0]] instanceof SauronsEye)) {
                instersections++;
            }
        }
        return instersections
    }

    getPath(startX: number, startY: number, endX: number, endY: number) {
        // Initialize an empty array to store the coordinates of the points on the path
        let path: Array<[number, number]> = [];

        // Use the Bresenham's line algorithm to get the coordinates of the points on the path
        let x1 = startX, y1 = startY, x2 = endX, y2 = endY;
        const isSteep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
        if (isSteep) {
            [x1, y1] = [y1, x1];
            [x2, y2] = [y2, x2];
        }
        let isReversed = false;
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
            isReversed = true;
        }
        const deltax = x2 - x1, deltay = Math.abs(y2 - y1);
        let error = Math.floor(deltax / 2);
        let y = y1;
        let ystep;
        if (y1 < y2) {
            ystep = 1;
        } else {
            ystep = -1;
        }
        for (let x = x1; x <= x2; x++) {
            if (isSteep) {
                path.push([y, x]);
            } else {
                path.push([x, y]);
            }
            error -= deltay;
            if (error < 0) {
                y += ystep;
                error += deltax;
            }
        }

        // If the line is reversed, reverse the order of the points in the path
        if (isReversed) {
            path = path.reverse();
        }

        return path;
    }

    static pathPossible(checkpoints, startFields, board, walls) {
        for (const startFieldsKey in startFields) {
            const startField = startFields[startFieldsKey];
            for (const checkpointsKey in checkpoints) {
                const checkpoint = checkpoints[checkpointsKey];
                const aStar = new AStar(checkpoint, startField, board, walls);
                const path = aStar.AStar();
                if (path.length < 1) {
                    return false;
                }
            }
        }
        return true;
    }

}

export default AStar;