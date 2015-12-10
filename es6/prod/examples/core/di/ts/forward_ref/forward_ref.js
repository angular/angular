var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injector, forwardRef, resolveForwardRef } from 'angular2/core';
// #docregion forward_ref_fn
var ref = forwardRef(() => Lock);
// #enddocregion
// #docregion forward_ref
class Door {
    constructor(lock) {
        this.lock = lock;
    }
}
Door = __decorate([
    __param(0, Inject(forwardRef(() => Lock))), 
    __metadata('design:paramtypes', [Lock])
], Door);
// Only at this point Lock is defined.
class Lock {
}
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
