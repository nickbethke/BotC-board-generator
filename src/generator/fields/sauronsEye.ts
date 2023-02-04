import {BoardPosition} from "../boardGenerator";
import {DirectionEnum} from "../../interfaces/boardConfigInterface";
import FieldWithPositionAndDirectionInterface from "../../interfaces/fieldWithPositionAndDirectionInterface";

class SauronsEye implements FieldWithPositionAndDirectionInterface {

    readonly direction: DirectionEnum;
    readonly position: BoardPosition;

    constructor(position: BoardPosition, direction: DirectionEnum) {
        this.position = position;
        this.direction = direction;
    }

}

export default SauronsEye;