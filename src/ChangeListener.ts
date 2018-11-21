import { Parameter } from "./parameter/Parameter";

export interface ChangedListener {

  (parameter: Parameter): void;

}
