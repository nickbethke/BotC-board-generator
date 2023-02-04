import FieldWithPositionInterface from "../../interfaces/fieldWithPositionInterface";
import {BoardPosition} from "../boardGenerator";

class Checkpoint implements FieldWithPositionInterface {
    readonly position: BoardPosition;
    readonly order: number;

    constructor(position: BoardPosition, order: number) {
        this.position = position;
        this.order = order;
    }
}

export default Checkpoint;