import FieldWithPositionInterface from "../../interfaces/fieldWithPositionInterface";
import {BoardPosition} from "../boardGenerator";

class Hole implements FieldWithPositionInterface {
    readonly position: BoardPosition;

    constructor(position: BoardPosition) {
        this.position = position;

    }

}

export default Hole;