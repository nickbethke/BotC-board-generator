import FieldWithPositionInterface from "./fieldWithPositionInterface";

interface FieldWithPositionAndAmountInterface extends FieldWithPositionInterface {
    amount: number
}

export default FieldWithPositionAndAmountInterface;