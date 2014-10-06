import {CONST} from "facade/lang";

export class Inject {
  @CONST()
  constructor(token){
    this.token = token;
  }
}

export class InjectFuture {
  @CONST()
  constructor(token){
    this.token = token;
  }
}

export class InjectLazy {
  @CONST()
  constructor(token){
    this.token = token;
  }
}