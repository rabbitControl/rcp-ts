import { GroupParameter } from '.';
import { Parameter } from './parameter/Parameter';

export interface ParameterManager {

    getParameter(id: number): Parameter | undefined;
    setParameterDirty(parameter: Parameter): void;
    getRootGroup(): GroupParameter;
    waitForParent(parameterid: number, parentid: number): void;
}