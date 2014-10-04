import {CONST} from "facade/lang";

export class Inject {
  @CONST()
  constructor(token){
    this.token = token;
  }
}