import { Parameter } from "./parameter/Parameter";
import { ValueParameter } from "./parameter/ValueParameter";

export interface ChangedListener {

  (parameter: Parameter): void;

}

export interface ValueChangedListener<T> {

  (parameter: ValueParameter<T>): void;

}