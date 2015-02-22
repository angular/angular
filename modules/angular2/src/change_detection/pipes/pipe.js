export var NO_CHANGE = new Object();

export class Pipe {
  supports(obj):boolean {return false;}
  transform(value:any):any {return null;}
}