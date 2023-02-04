import Ajv, {JSONSchemaType} from 'ajv';
import BoardConfigInterface from "./interfaces/boardConfigInterface";
import * as BoardConfigSchema from './boardConfigSchema.json';

class JSONValidation {
    private readonly _json: JSON;

    constructor(json: JSON) {
        this._json = json;
    }

    valid(): boolean {
        const ajv = new Ajv({allErrors: true});
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const schema: JSONSchemaType<BoardConfigInterface> = BoardConfigSchema;
        const validate = ajv.compile(schema);
        return (validate(this._json));
    }
}

export default JSONValidation;