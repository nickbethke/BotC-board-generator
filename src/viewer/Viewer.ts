import BoardConfigInterface, {Direction, DirectionEnum, Position} from "../interfaces/boardConfigInterface";
import {CanvasRenderingContext2D, createCanvas, loadImage} from "canvas";
import * as fs from "fs";
import * as D3Node from "d3-node";
import * as mime from "mime-types"
import BoardGenerator, {RandomBoardInterface} from "../generator/boardGenerator";
import * as sharp from "sharp";


class Viewer {
    private readonly _json: BoardConfigInterface;
    private _startValues: RandomBoardInterface;


    constructor(generator: BoardGenerator) {
        this._json = generator.json;
        this._startValues = generator.startValues;
    }

    private readonly _backgroundColor: string = '#312f2f';
    private readonly _shadowBackgroundColor: string = '#888888';
    private readonly _grassColor: string = '#7ec850';
    private readonly _borderColor: string = '#4f872d';
    private readonly _riverColor: string = '#1ca3ec';
    private readonly _wallColor = '#000000';

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
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

        // background
        ctx.fillStyle = this._backgroundColor
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
        ctx.fillStyle = this._shadowBackgroundColor;
        ctx.fillRect(offSet + 2, offSet + 2, width * fieldSize, height * fieldSize);

        // board Background
        ctx.fillStyle = this._grassColor;
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

                            ctx.fillStyle = this._riverColor;
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
                            ctx.strokeStyle = this._borderColor;
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
                                ctx.strokeStyle = this._wallColor;
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

                            if (!fs.existsSync('./dist/' + filename + "/"))
                                fs.mkdirSync('./dist/' + filename + "/");
                            fs.writeFileSync('./dist/' + filename + "/" + 'board.png', imgBuffer);

                            sharp(imgBuffer).rotate().webp().toBuffer().then(buffer => {
                                fs.writeFileSync('./dist/' + filename + "/" + 'board.webp', buffer);
                            })

                            sharp(imgBuffer).rotate().jpeg({mozjpeg: true, quality: 90}).toBuffer().then(buffer => {
                                fs.writeFileSync('./dist/' + filename + "/" + 'board.jpeg', buffer);
                            })

                            fs.writeFileSync('./dist/' + filename + "/" + 'board.json', JSON.stringify(this._json, null, 4));
                        })
                    })
                });
            })


        });
    }

    public drawSVG(filename: string): void {

        const fieldSize = 64;
        const offSet = 64;
        const offSetBottom = 128;

        const {width, height} = this._json;

        const dimension: { w: number, h: number } = {
            w: Math.max(width * fieldSize + (2 * offSet), 640),
            h: height * fieldSize + (offSet + offSetBottom)
        };
        const d3 = new D3Node({styles: 'text {font-family:system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif; font-size: 16px; fill: #ffffff} .label{font-size: 14px}'})
        const svg = d3.createSVG().attr('width', dimension.w).attr('height', dimension.h).attr('xmlns', 'http://www.w3.org/2000/svg');

        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dimension.w)
            .attr("height", dimension.h)
            .style("fill", "#312f2f");

        const textGroup = svg.append('g');

        textGroup.append("text")
            .attr("x", dimension.w / 2)
            .attr('y', ((offSet + 16) / 2))
            .text(this._json.name)
            .attr('text-anchor', 'middle')

        this.svgAddText(textGroup, "Width: " + this._startValues.width, offSet, 8 + height * fieldSize + offSet + (22));
        this.svgAddText(textGroup, "Height: " + this._startValues.height, offSet, 8 + height * fieldSize + offSet + (22 * 2));
        this.svgAddText(textGroup, "Start Fields: " + this._startValues.startFields, offSet, 8 + height * fieldSize + offSet + (22 * 3));
        this.svgAddText(textGroup, "Checkpoints: " + this._startValues.checkpoints, offSet, 8 + height * fieldSize + offSet + (22 * 4));
        this.svgAddText(textGroup, "Holes: " + this._startValues.holes, offSet * 3, 8 + height * fieldSize + offSet + (22));
        this.svgAddText(textGroup, "Lembas Fields: " + this._startValues.lembasFields, offSet * 3, 8 + height * fieldSize + offSet + (22 * 2));
        this.svgAddText(textGroup, "Lembas Max Value: " + this._startValues.maxLembasAmountOnField, offSet * 3, 8 + height * fieldSize + offSet + (22 * 3));
        this.svgAddText(textGroup, "Forced Lembas Max Value: " + (this._startValues.lembasAmountExactMaximum ? "true" : "false"), offSet * 3, 8 + height * fieldSize + offSet + (22 * 4));
        this.svgAddText(textGroup, "Rivers : " + (this._startValues.rivers ? "true" : "false"), offSet * 7, 8 + height * fieldSize + offSet + (22));
        this.svgAddText(textGroup, "River Algorithm: " + this._startValues.riverAlgorithm, offSet * 7, 8 + height * fieldSize + offSet + (22 * 2));
        this.svgAddText(textGroup, "Walls: " + (this._startValues.walls ? "true" : "false"), offSet * 7, 8 + height * fieldSize + offSet + (22 * 3));

        svg.append('rect')
            .attr("x", offSet + 2)
            .attr("y", offSet + 2)
            .attr('width', width * fieldSize)
            .attr('height', height * fieldSize)
            .attr('fill', this._shadowBackgroundColor)

        svg.append('rect')
            .attr("x", offSet)
            .attr("y", offSet)
            .attr('width', width * fieldSize)
            .attr('height', height * fieldSize)
            .attr('fill', this._grassColor)

        const {eye, holes, lembas, checkPoints, startFields, riverFields, walls} = this._json;
        const {x, y} = Viewer.arrayPositionToImagePosition(eye.position, offSet, fieldSize);

        const sauronsEyeImage = Viewer.base64_encode('./src/images/eye.png');
        const sauronsGroup = svg.append('g');
        sauronsGroup.append('svg:image')
            .attr("x", x + 8)
            .attr("y", y + 8)
            .attr('width', fieldSize - 16)
            .attr('height', fieldSize - 16)
            .attr("xlink:href", sauronsEyeImage)

        Viewer.drawArrowSVG(sauronsGroup, eye.direction, x + (fieldSize / 2), y + (fieldSize / 2), fieldSize / 2);

        const holeImage = Viewer.base64_encode('./src/images/hole.png');
        const holesGroup = svg.append('g');
        for (const holesKey in holes) {
            const hole = holes[holesKey];
            const {x, y} = Viewer.arrayPositionToImagePosition(hole, offSet, fieldSize);
            holesGroup.append('svg:image')
                .attr("x", x)
                .attr("y", y)
                .attr('width', fieldSize)
                .attr('height', fieldSize)
                .attr("xlink:href", holeImage)
        }

        const lembasImage = Viewer.base64_encode('./src/images/lembas.png');
        const lembasGroup = svg.append('g');
        for (const lembasKey in lembas) {
            const lembas_ = lembas[lembasKey];
            const {x, y} = Viewer.arrayPositionToImagePosition(lembas_.position, offSet, fieldSize);
            const group = lembasGroup.append('g');
            group.append('svg:image')
                .attr("x", x + 8)
                .attr("y", y + 8)
                .attr('width', fieldSize - 16)
                .attr('height', fieldSize - 16)
                .attr("xlink:href", lembasImage)

            group.append('text')
                .attr("x", x + fieldSize - 4)
                .attr("y", y + fieldSize - 4)
                .text(lembas_.amount.toString())
                .attr('text-anchor', 'end')

        }

        const checkpointImage = Viewer.base64_encode('./src/images/checkpoint.png');
        const checkpointsGroup = svg.append('g');
        for (const checkPointsKey in checkPoints) {
            const checkpoint = checkPoints[checkPointsKey];
            const order = Number.parseInt(checkPointsKey) + 1;
            const {x, y} = Viewer.arrayPositionToImagePosition(checkpoint, offSet, fieldSize);
            const group = checkpointsGroup.append('g');
            group.append('svg:image')
                .attr("x", x + 8)
                .attr("y", y + 8)
                .attr('width', fieldSize - 16)
                .attr('height', fieldSize - 16)
                .attr("xlink:href", checkpointImage)

            group.append('text')
                .attr("x", x + fieldSize - 4)
                .attr("y", y + fieldSize - 4)
                .text(order.toString())
                .attr('text-anchor', 'end')

        }

        const startFieldImage = Viewer.base64_encode('./src/images/start.png');

        const startFieldGroup = svg.append("g")

        for (const startFieldsKey in startFields) {
            const startField = startFields[startFieldsKey];
            const {
                x,
                y
            } = Viewer.arrayPositionToImagePosition(startField.position, offSet, fieldSize);
            const group = startFieldGroup.append("g")
            group.append('svg:image')
                .attr("x", x + 8)
                .attr("y", y + 8)
                .attr('width', fieldSize - 16)
                .attr('height', fieldSize - 16)
                .attr("xlink:href", startFieldImage)
            Viewer.drawArrowSVG(group, startField.direction, x + (fieldSize / 2), y + (fieldSize / 2), fieldSize / 2);
        }

        const riverGroup = svg.append("g")

        for (const riverFieldsKey in riverFields) {
            const river = riverFields[riverFieldsKey];
            const {
                x,
                y
            } = Viewer.arrayPositionToImagePosition(river.position, offSet, fieldSize);
            const group = riverGroup.append("g")
            group.append('rect')
                .attr("x", x)
                .attr("y", y)
                .attr('width', fieldSize)
                .attr('height', fieldSize)
                .attr('fill', this._riverColor)

            Viewer.drawArrowSVG(group, river.direction, x + (fieldSize / 2), y + (fieldSize / 2), fieldSize / 2);
        }

        const linesGroup = svg.append("g")
            .style("stroke", this._borderColor)
            .style("stroke-width", 3)

        for (let i = 1; i < this._json.width; i++) {
            linesGroup.append('line')
                .attr("x1", offSet + (fieldSize * i))
                .attr("y1", offSet)
                .attr("x2", offSet + (fieldSize * i))
                .attr("y2", offSet + (fieldSize * this._json.height));
        }

        for (let i = 1; i < this._json.height; i++) {
            linesGroup.append('line')
                .attr("x1", offSet)
                .attr("y1", offSet + (fieldSize * i))
                .attr("x2", offSet + (fieldSize * this._json.width))
                .attr("y2", offSet + (fieldSize * i));
        }

        const wallsGroup = svg.append("g")
            .attr("stroke", this._wallColor)
            .attr("stroke-width", 7)

        for (const wallsKey in walls) {
            const wall = walls[wallsKey];
            const {x, y, up} = Viewer.wallPositionToImagePosition(wall, offSet, fieldSize);

            if (up) {
                wallsGroup.append('line')
                    .attr("x1", x)
                    .attr("y1", y)
                    .attr("x2", x)
                    .attr("y2", y - fieldSize);
            } else {
                wallsGroup.append('line')
                    .attr("x1", x)
                    .attr("y1", y)
                    .attr("x2", x - fieldSize)
                    .attr("y2", y);
            }
        }

        if (!fs.existsSync('./dist/' + filename + "/"))
            fs.mkdirSync('./dist/' + filename + "/");
        fs.writeFileSync('./dist/' + filename + "/" + 'board.svg', d3.svgString());

    }

    private svgAddText(svg: any, text: string, x: number, y: number): void {
        svg.append("text")
            .attr("x", x)
            .attr('y', y)
            .text(text)
            .attr('text-anchor', 'start')
            .attr('class', 'label')
    }

    private static base64_encode(file): string {
        const mimeType = mime.lookup(file);
        // read binary data
        const bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return "data:" + mimeType + ";base64," + Buffer.from(bitmap).toString('base64');
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

    private static drawArrowSVG(svg: any, direction: Direction, x: number, y: number, size: number) {
        const arrowImage = Viewer.base64_encode('./src/images/arrow.png');
        const rotation = DirectionEnum[direction] * 90;
        svg.append("svg:image")
            .attr("transform-origin", x + " " + y)
            .attr("transform", "rotate(" + rotation + ")")
            .attr("filter", 'invert(1)')
            .attr("x", (x - (size / 2)))
            .attr("y", (y - (size / 2)))
            .attr('width', size)
            .attr('height', size)
            .attr("xlink:href", arrowImage)
    }


}

export default Viewer;