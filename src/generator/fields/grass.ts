import FieldWithPositionInterface from "../../interfaces/fieldWithPositionInterface";
import {BoardPosition} from "../boardGenerator";

class Grass implements FieldWithPositionInterface {
    readonly position: BoardPosition;

    constructor(position: BoardPosition) {
        this.position = position;
    }

}

export default Grass;