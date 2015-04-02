export var NO_CHANGE = new Object();

/**
 * @publicModule angular2/angular2
 */
export class Pipe {
  supports(obj):boolean {return false;}
  onDestroy() {}
  transform(value:any):any {return null;}
}