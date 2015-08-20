import {CONST} from 'angular2/src/core/facade/lang';

@CONST()
export class OpaqueToken {
  _desc: string;

  constructor(desc: string) { this._desc = 'Token(' + desc + ')'; }

  toString(): string { return this._desc; }
}
