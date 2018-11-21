import { Parameter } from './parameter/Parameter';

export interface ParameterManager {

    getParameter(id: number): Parameter | undefined;
    setParameterDirty(pararmeter: Parameter): void;

}