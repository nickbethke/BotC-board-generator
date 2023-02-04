import FieldWithPositionAndDirectionInterface from "../../interfaces/fieldWithPositionAndDirectionInterface";
import {DirectionEnum} from "../../interfaces/boardConfigInterface";
import {BoardPosition} from "../boardGenerator";

class StartField implements FieldWithPositionAndDirectionInterface {
    readonly direction: DirectionEnum;
    readonly position: BoardPosition;

    constructor(position: BoardPosition, direction: DirectionEnum) {
        this.position = position;
        this.direction = direction;
    }

}
export default StartField;