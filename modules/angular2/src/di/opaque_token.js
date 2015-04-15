/**
 * 
 * 
 * @exportedAs angular2/di
 */
export class OpaqueToken {
  _desc:string;

  constructor(desc:string){
    this._desc = `Token(${desc})`;
  }

  toString() {
    return this._desc;
  }
}