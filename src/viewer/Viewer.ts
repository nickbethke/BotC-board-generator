import BoardConfigInterface, {Direction, Position} from "../interfaces/boardConfigInterface";
import {CanvasRenderingContext2D, createCanvas, loadImage} from "canvas";
import * as fs from "fs";
import {RandomBoardInterface} from "../generator/boardGenerator";
import BoardGenerator from "../generator/boardGenerator";

class Viewer {
    private readonly _json: BoardConfigInterface;
    private _startValues: RandomBoardInterface;

    constructor(generator: BoardGenerator) {
        this._json = generator.json;
        this._startValues = generator.startValues;
    }

    draw(filename = 'board'): void {

        const fieldSize = 64;
        const offSet = 64;
        const offSetBottom = 128;

        const {width, height, name} = this._json;

        const dimension = {
            w: Math.max(width * fieldSize + (2 * offSet), 640),
            h: height * fieldSize + (offSet + offSetBottom)
        };

        const canvas = createCanvas(dimension.w, dimension.h);
        const ctx:CanvasRenderingContext2D = canvas.getContext("2d");

        // background
        ctx.fillStyle = '#312f2f'
        ctx.fillRect(0, 0, dimension.w, dimension.h)

        //name
        ctx.fillStyle = "#ffffff";
        ctx.font = '16px Sans';
        ctx.textAlign = "center";
        ctx.fillText(name, dimension.w / 2, ((offSet + 16) / 2));

        // start Values
        ctx.fillStyle = "#ffffff";
        ctx.font = '14px Sans';
        ctx.textAlign = "left";
        ctx.fillText("Width: " + this._startValues.width, offSet, 8 + height * fieldSize + offSet + (22));
        ctx.fillText("Height: " + this._startValues.height, offSet, 8 + height * fieldSize + offSet + (22 * 2));
        ctx.fillText("Start Fields: " + this._startValues.startFields, offSet, 8 + height * fieldSize + offSet + (22 * 3));
        ctx.fillText("Checkpoints: " + this._startValues.checkpoints, offSet, 8 + height * fieldSize + offSet + (22 * 4));
        ctx.fillText("Holes: " + this._startValues.holes, offSet * 3, 8 + height * fieldSize + offSet + (22));
        ctx.fillText("Lembas Fields: " + this._startValues.lembasFields, offSet * 3, 8 + height * fieldSize + offSet + (22 * 2));
        ctx.fillText("Lembas Max Value: " + this._startValues.maxLembasAmountOnField, offSet * 3, 8 + height * fieldSize + offSet + (22 * 3));
        ctx.fillText("Forced Lembas Max Value: " + (this._startValues.lembasAmountExactMaximum ? "true" : "false"), offSet * 3, 8 + height * fieldSize + offSet + (22 * 4));
        ctx.fillText("Rivers : " + (this._startValues.rivers ? "true" : "false"), offSet * 7, 8 + height * fieldSize + offSet + (22));
        ctx.fillText("River Algorithm: " + this._startValues.riverAlgorithm, offSet * 7, 8 + height * fieldSize + offSet + (22 * 2));
        ctx.fillText("Walls: " + (this._startValues.walls ? "true" : "false"), offSet * 7, 8 + height * fieldSize + offSet + (22 * 3));

        // board Shadow
        ctx.fillStyle = '#888888'
        ctx.fillRect(offSet + 2, offSet + 2, width * fieldSize, height * fieldSize);

        // board Background
        ctx.fillStyle = "#7ec850";
        ctx.fillRect(offSet, offSet, width * fieldSize, height * fieldSize);

        // saurons eye
        const {eye, holes, lembas, checkPoints, startFields, riverFields, walls} = this._json;
        const {x, y} = Viewer.arrayPositionToImagePosition(eye.position, offSet, fieldSize);

        loadImage('./src/images/eye.png').then((data) => {
            ctx.drawImage(data, x + 8, y + 8, fieldSize - 16, fieldSize - 16)
            Viewer.drawArrow(ctx, eye.direction, x + (fieldSize / 2), y + (fieldSize / 2), fieldSize / 4);

            // holes
            loadImage('./src/images/hole.png').then((data) => {
                for (const holesKey in holes) {
                    const hole = holes[holesKey];
                    const {x, y} = Viewer.arrayPositionToImagePosition(hole, offSet, fieldSize);
                    ctx.drawImage(data, x, y, fieldSize, fieldSize)
                }

                // lembas
                loadImage('./src/images/lembas.png').then((data) => {
                    for (const lembasKey in lembas) {
                        const lembas_ = lembas[lembasKey];
                        const {x, y} = Viewer.arrayPositionToImagePosition(lembas_.position, offSet, fieldSize);
                        ctx.drawImage(data, x + 8, y + 8, fieldSize - 16, fieldSize - 16)
                        ctx.fillStyle = "#ffffff";
                        ctx.textAlign = "right";
                        ctx.fillText(lembas_.amount.toString(), x + fieldSize - 4, y + fieldSize - 4);
                    }

                    //checkpoints
                    loadImage('./src/images/checkpoint.png').then((data) => {
                        for (const checkPointsKey in checkPoints) {
                            const checkpoint = checkPoints[checkPointsKey];
                            const order = Number.parseInt(checkPointsKey) + 1;
                            const {x, y} = Viewer.arrayPositionToImagePosition(checkpoint, offSet, fieldSize);
                            ctx.drawImage(data, x + 8, y + 8, fieldSize - 16, fieldSize - 16)
                            ctx.fillText(order.toString(), x + fieldSize - 4, y + fieldSize - 4);
                        }
                        //starts
                        loadImage('./src/images/start.png').then((data) => {

                            for (const startFieldsKey in startFields) {
                                const startField = startFields[startFieldsKey];
                                const {
                                    x,
                                    y
                                } = Viewer.arrayPositionToImagePosition(startField.position, offSet, fieldSize);
                                ctx.drawImage(data, x + 8, y + 8, fieldSize - 16, fieldSize - 16)
                                Viewer.drawArrow(ctx, startField.direction, x + (fieldSize / 2), y + (fieldSize / 2), fieldSize / 4);
                            }

                            ctx.fillStyle = "#35c8fe";
                            for (const riverFieldsKey in riverFields) {
                                const river = riverFields[riverFieldsKey];
                                const {
                                    x,
                                    y
                                } = Viewer.arrayPositionToImagePosition(river.position, offSet, fieldSize);
                                ctx.fillRect(x, y, fieldSize, fieldSize);
                                Viewer.drawArrow(ctx, river.direction, x + (fieldSize / 2), y + (fieldSize / 2), fieldSize / 4);
                            }


                            // grass fields
                            ctx.lineWidth = 3;
                            ctx.strokeStyle = "#4f872d";
                            for (let y = 0; y < height; y++) {
                                for (let x = 0; x < width; x++) {
                                    ctx.beginPath();
                                    ctx.moveTo(offSet + (x * fieldSize), offSet + (y * fieldSize));
                                    ctx.lineTo(offSet + ((x + 1) * fieldSize), offSet + (y * fieldSize));
                                    ctx.lineTo(offSet + ((x + 1) * fieldSize), offSet + ((y + 1) * fieldSize));
                                    ctx.lineTo(offSet + (x * fieldSize), offSet + ((y + 1) * fieldSize));
                                    ctx.lineTo(offSet + (x * fieldSize), offSet + (y * fieldSize));
                                    ctx.closePath();
                                    ctx.stroke();
                                }
                            }

                            for (const wallsKey in walls) {
                                const wall = walls[wallsKey];
                                ctx.lineWidth = 7;
                                const {x, y, up} = Viewer.wallPositionToImagePosition(wall, offSet, fieldSize);
                                ctx.strokeStyle = "#000000";
                                ctx.beginPath();
                                ctx.moveTo(x, y);
                                if (up) {
                                    ctx.lineTo(x, y - fieldSize);
                                } else {
                                    ctx.lineTo(x - fieldSize, y);
                                }
                                ctx.stroke();
                            }
                            const imgBuffer = canvas.toBuffer('image/png')
                            fs.writeFileSync('./dist/' + filename + '.png', imgBuffer);
                        })
                    })
                });
            })


        });

    }

    private static arrayPositionToImagePosition(position: Position, offSet: number, fieldSize: number): { x: number, y: number } {

        return {x: offSet + (position[0] * fieldSize), y: offSet + (position[1] * fieldSize)};
    }

    private static wallPositionToImagePosition(position: Position[], offSet: number, fieldSize: number): { x: number, y: number, up: boolean } {
        const _x1 = position[0][1];
        const _y1 = position[0][0];
        const _x2 = position[1][1];
        const _y2 = position[1][0];

        if (_x1 > _x2 || _y1 > _y2) {
            const {x, y} = Viewer.arrayPositionToImagePosition(position[1], offSet, fieldSize);
            if (_x1 == _x2) {
                return {x: x + (fieldSize), y: y + fieldSize, up: true};
            } else {
                return {x: x + (fieldSize), y: y + fieldSize, up: false};
            }


        }
        if (_x1 < _x2 || _y1 < _y2) {
            const {x, y} = Viewer.arrayPositionToImagePosition(position[0], offSet, fieldSize);
            if (_x1 == _x2) {
                return {x: x + (fieldSize), y: y + fieldSize, up: true};
            } else {
                return {x: x + (fieldSize), y: y + fieldSize, up: false};
            }
        }
        return {x: 0, y: 0, up: true};

    }

    private static drawArrow(
        context: CanvasRenderingContext2D,
        direction: Direction,
        x: number,
        y: number,
        size: number
    ): void {
        context.save();
        context.lineWidth = 3;
        context.strokeStyle = "#ffffff";
        // Draw the arrow
        switch (direction) {
            case "NORTH":
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y - size);
                context.lineTo(x + size / 4, y - size + size / 4);
                context.moveTo(x, y - size);
                context.lineTo(x - size / 4, y - size + size / 4);
                context.closePath();
                context.stroke();
                break;
            case "EAST":
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + size, y);
                context.lineTo(x + size - size / 4, y - size / 4);
                context.moveTo(x + size, y);
                context.lineTo(x + size - size / 4, y + size / 4);
                context.closePath();
                context.stroke();
                break;
            case "SOUTH":
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y + size);
                context.lineTo(x + size / 4, y + size - size / 4);
                context.moveTo(x, y + size);
                context.lineTo(x - size / 4, y + size - size / 4);
                context.closePath();
                context.stroke();
                break;
            case "WEST":
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x - size, y);
                context.lineTo(x - size + size / 4, y - size / 4);
                context.moveTo(x - size, y);
                context.lineTo(x - size + size / 4, y + size / 4);
                context.closePath();
                context.stroke();
                break;
        }
        context.restore();
    }


}

export default Viewer;