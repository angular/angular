// todo(robwormald): fix all this TS business once Rx typings are sorted...
var Observable = require('@reactivex/rxjs/dist/cjs/Observable');
var Operator = require('@reactivex/rxjs/dist/cjs/Operator');
var map = require('@reactivex/rxjs/dist/cjs/operators/map');

class ResponseObservable extends Observable {
  source: any;
  operator: any;
  lift<T, R>(operator:any): ResponseObservable {
    const observable = new ResponseObservable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
  subscribe: (next:Function, error:Function, complete:Function) => any;
}

ResponseObservable.prototype.map = map;

export {ResponseObservable}