import {isPresent} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, MapWrapper} from 'angular2/src/core/facade/collection';

export class Locals {
  constructor(public parent: Locals, public current: Map<any, any>) {}

  contains(name: string): boolean {
    if (this.current.has(name)) {
      return true;
    }

    if (isPresent(this.parent)) {
      return this.parent.contains(name);
    }

    return false;
  }

  get(name: string): any {
    if (this.current.has(name)) {
      return this.current.get(name);
    }

    if (isPresent(this.parent)) {
      return this.parent.get(name);
    }

    throw new BaseException(`Cannot find '${name}'`);
  }

  set(name: string, value: any): void {
    // TODO(rado): consider removing this check if we can guarantee this is not
    // exposed to the public API.
    // TODO: vsavkin maybe it should check only the local map
    if (this.current.has(name)) {
      this.current.set(name, value);
    } else {
      throw new BaseException(
          `Setting of new keys post-construction is not supported. Key: ${name}.`);
    }
  }

  clearValues(): void { MapWrapper.clearValues(this.current); }
}
