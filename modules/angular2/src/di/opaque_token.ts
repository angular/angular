import {CONST} from 'angular2/src/facade/lang';

/**
 *
 *
 * @exportedAs angular2/di
 */

@CONST()
export class OpaqueToken {
  _desc: string;

  constructor(desc: string) { this._desc = 'Token(' + desc + ')'; }

  toString(): string { return this._desc; }
}
