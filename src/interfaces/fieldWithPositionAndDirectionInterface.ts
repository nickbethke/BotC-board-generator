import {DirectionEnum} from "./boardConfigInterface";
import FieldWithPositionInterface from "./fieldWithPositionInterface";

interface FieldWithPositionAndDirectionInterface extends FieldWithPositionInterface {
    readonly direction: DirectionEnum

}

export default FieldWithPositionAndDirectionInterface;