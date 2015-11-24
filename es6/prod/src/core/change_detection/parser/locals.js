import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { MapWrapper } from 'angular2/src/facade/collection';
export class Locals {
    constructor(parent, current) {
        this.parent = parent;
        this.current = current;
    }
    contains(name) {
        if (this.current.has(name)) {
            return true;
        }
        if (isPresent(this.parent)) {
            return this.parent.contains(name);
        }
        return false;
    }
    get(name) {
        if (this.current.has(name)) {
            return this.current.get(name);
        }
        if (isPresent(this.parent)) {
            return this.parent.get(name);
        }
        throw new BaseException(`Cannot find '${name}'`);
    }
    set(name, value) {
        // TODO(rado): consider removing this check if we can guarantee this is not
        // exposed to the public API.
        // TODO: vsavkin maybe it should check only the local map
        if (this.current.has(name)) {
            this.current.set(name, value);
        }
        else {
            throw new BaseException(`Setting of new keys post-construction is not supported. Key: ${name}.`);
        }
    }
    clearValues() { MapWrapper.clearValues(this.current); }
}
