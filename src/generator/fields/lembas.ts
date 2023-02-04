import FieldWithPositionAndAmountInterface from "../../interfaces/FieldWithPositionAndAmountInterface";
import {BoardPosition} from "../boardGenerator";

class Lembas implements FieldWithPositionAndAmountInterface {
    amount: number;
    readonly position: BoardPosition;

    constructor(position: BoardPosition, amount: number) {
        this.position = position;
        this.amount = amount;
    }


}

export default Lembas;