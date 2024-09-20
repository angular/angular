/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PerfLogEvent} from '../index';

export class TraceEventFactory {
  constructor(
    private _cat: string,
    private _pid: string,
  ) {}

  create(ph: any, name: string, time: number, args: any = null) {
    const res: PerfLogEvent = {
      'name': name,
      'cat': this._cat,
      'ph': ph,
      'ts': time,
      'pid': this._pid,
    };
    if (args != null) {
      res['args'] = args;
    }
    return res;
  }

  markStart(name: string, time: number) {
    return this.create('B', name, time);
  }

  markEnd(name: string, time: number) {
    return this.create('E', name, time);
  }

  start(name: string, time: number, args: any = null) {
    return this.create('B', name, time, args);
  }

  end(name: string, time: number, args: any = null) {
    return this.create('E', name, time, args);
  }

  instant(name: string, time: number, args: any = null) {
    return this.create('I', name, time, args);
  }

  complete(name: string, time: number, duration: number, args: any = null) {
    const res = this.create('X', name, time, args);
    res['dur'] = duration;
    return res;
  }
}
