import { MenuAction } from "src/app/store/menu/model";

export interface ModuleParam {
    id?: number;
    moduleParamLibelle?: string;
    moduleParamCode?: string;
    deleted?: boolean;
    menuActions?: MenuAction[];
}