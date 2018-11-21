import { Parameter } from './parameter/Parameter';

export default interface ParameterManager {

    getParameter(id: number): Parameter | undefined;
    setParameterDirty(pararmeter: Parameter): void;

}