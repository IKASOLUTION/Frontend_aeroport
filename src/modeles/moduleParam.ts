import { MenuAction } from "./menuAction";

export interface ModuleParam {
    id?: number;
    moduleParamLibelle?: string;
    moduleParamCode?: string;
    deleted?: boolean;
    menuActions?: MenuAction[];
}