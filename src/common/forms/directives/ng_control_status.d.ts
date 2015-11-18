import { NgControl } from './ng_control';
export declare class NgControlStatus {
    private _cd;
    constructor(cd: NgControl);
    ngClassUntouched: boolean;
    ngClassTouched: boolean;
    ngClassPristine: boolean;
    ngClassDirty: boolean;
    ngClassValid: boolean;
    ngClassInvalid: boolean;
}
