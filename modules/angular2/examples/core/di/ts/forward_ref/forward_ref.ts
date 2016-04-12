import {Inject, Injector, forwardRef, resolveForwardRef, ForwardRefFn} from 'angular2/core';

// #docregion forward_ref_fn
var ref = forwardRef(() => Lock);
// #enddocregion

// #docregion forward_ref
class Door {
  lock: Lock;
  constructor(@Inject(forwardRef(() => Lock)) lock: Lock) { this.lock = lock; }
}

// Only at this point Lock is defined.
class Lock {}

var injector = Injector.resolveAndCreate([Door, Lock]);
var door = injector.get(Door);
expect(door instanceof Door).toBe(true);
expect(door.lock instanceof Lock).toBe(true);
// #enddocregion

// #docregion resolve_forward_ref
var ref = forwardRef(() => "refValue");
expect(resolveForwardRef(ref)).toEqual("refValue");
expect(resolveForwardRef("regularValue")).toEqual("regularValue");
// #enddocregion