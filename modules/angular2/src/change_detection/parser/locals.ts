import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

export class Locals {
  constructor(public parent: Locals, public current: Map<any, any>) {}

  contains(name: string): boolean {
    if (MapWrapper.contains(this.current, name)) {
      return true;
    }

    if (isPresent(this.parent)) {
      return this.parent.contains(name);
    }

    return false;
  }

  get(name: string) {
    if (MapWrapper.contains(this.current, name)) {
      return MapWrapper.get(this.current, name);
    }

    if (isPresent(this.parent)) {
      return this.parent.get(name);
    }

    throw new BaseException(`Cannot find '${name}'`);
  }

  set(name: string, value): void {
    // TODO(rado): consider removing this check if we can guarantee this is not
    // exposed to the public API.
    // TODO: vsavkin maybe it should check only the local map
    if (MapWrapper.contains(this.current, name)) {
      MapWrapper.set(this.current, name, value);
    } else {
      throw new BaseException(
          `Setting of new keys post-construction is not supported. Key: ${name}.`);
    }
  }

  clearValues(): void { MapWrapper.clearValues(this.current); }
}