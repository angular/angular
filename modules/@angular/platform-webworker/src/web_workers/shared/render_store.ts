/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

@Injectable()
export class RenderStore {
  private _nextIndex = 0;
  private _lookupById = new Map<number, any>();
  private _lookupByObject = new Map<any, number>();

  allocateId(): number { return this._nextIndex++; }

  store(obj: any, id: number): void {
    this._lookupById.set(id, obj);
    this._lookupByObject.set(obj, id);
  }

  remove(obj: any): void {
    const index = this._lookupByObject.get(obj);
    this._lookupByObject.delete(obj);
    this._lookupById.delete(index);
  }

  deserialize(id: number): any {
    return id == null || !this._lookupById.has(id) ? null : this._lookupById.get(id);
  }

  serialize(obj: any): number { return obj == null ? null : this._lookupByObject.get(obj); }
}
