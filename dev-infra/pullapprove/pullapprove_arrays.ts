/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PullApproveGroup} from './group';
import {getOrCreateGlob} from './utils';

export class PullApproveGroupStateDependencyError extends Error {
  constructor(message?: string) {
    super(message);
    // Set the prototype explicitly because in ES5, the prototype is accidentally
    // lost due to a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, PullApproveGroupStateDependencyError.prototype);
    // Error names are displayed in their stack but can't be set in the constructor.
    this.name = PullApproveGroupStateDependencyError.name;
  }
}

/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for files in conditions.
 */
export class PullApproveStringArray extends Array<string> {
  constructor(...elements: string[]) {
    super(...elements);

    // Set the prototype explicitly because in ES5, the prototype is accidentally
    // lost due to a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, PullApproveStringArray.prototype);
  }
  /** Returns a new array which only includes files that match the given pattern. */
  include(pattern: string): PullApproveStringArray {
    return new PullApproveStringArray(...this.filter(s => getOrCreateGlob(pattern).match(s)));
  }

  /** Returns a new array which only includes files that did not match the given pattern. */
  exclude(pattern: string): PullApproveStringArray {
    return new PullApproveStringArray(...this.filter(s => !getOrCreateGlob(pattern).match(s)));
  }
}

/**
 * Superset of a native array. The superset provides methods which mimic the
 * list data structure used in PullApprove for groups in conditions.
 */
export class PullApproveGroupArray extends Array<PullApproveGroup> {
  constructor(...elements: PullApproveGroup[]) {
    super(...elements);

    // Set the prototype explicitly because in ES5, the prototype is accidentally
    // lost due to a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, PullApproveGroupArray.prototype);
  }

  include(pattern: string): PullApproveGroupArray {
    return new PullApproveGroupArray(...this.filter(s => s.groupName.match(pattern)));
  }

  /** Returns a new array which only includes files that did not match the given pattern. */
  exclude(pattern: string): PullApproveGroupArray {
    return new PullApproveGroupArray(...this.filter(s => s.groupName.match(pattern)));
  }

  get pending() {
    throw new PullApproveGroupStateDependencyError();
  }

  get active() {
    throw new PullApproveGroupStateDependencyError();
  }

  get inactive() {
    throw new PullApproveGroupStateDependencyError();
  }

  get rejected() {
    throw new PullApproveGroupStateDependencyError();
  }

  get names() {
    return this.map(g => g.groupName);
  }
}
