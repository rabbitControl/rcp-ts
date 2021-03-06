import { GroupParameter } from '.';
import { Parameter } from './parameter/Parameter';

export interface ParameterManager {

    getParameter(id: number): Parameter | undefined;
    setParameterDirty(parameter: Parameter): void;
    getRootGroup(): GroupParameter;
    waitForParent(parameter: Parameter, parentid: number): void;
}