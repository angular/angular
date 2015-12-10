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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yd2FyZF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL2RpL3RzL2ZvcndhcmRfcmVmL2ZvcndhcmRfcmVmLnRzIl0sIm5hbWVzIjpbIkRvb3IiLCJEb29yLmNvbnN0cnVjdG9yIiwiTG9jayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBZSxNQUFNLGVBQWU7QUFFM0YsNEJBQTRCO0FBQzVCLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQ2pDLGdCQUFnQjtBQUVoQix5QkFBeUI7QUFDekI7SUFFRUEsWUFBNENBLElBQVVBO1FBQUlDLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO0lBQUNBLENBQUNBO0FBQy9FRCxDQUFDQTtBQUhEO0lBRWMsV0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQTs7U0FDNUM7QUFFRCxzQ0FBc0M7QUFDdEM7QUFBWUUsQ0FBQ0E7QUFFYixJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RCxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlCLE1BQU0sQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxnQkFBZ0I7QUFFaEIsaUNBQWlDO0FBQ2pDLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDbEUsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3QsIEluamVjdG9yLCBmb3J3YXJkUmVmLCByZXNvbHZlRm9yd2FyZFJlZiwgRm9yd2FyZFJlZkZufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuLy8gI2RvY3JlZ2lvbiBmb3J3YXJkX3JlZl9mblxudmFyIHJlZiA9IGZvcndhcmRSZWYoKCkgPT4gTG9jayk7XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gZm9yd2FyZF9yZWZcbmNsYXNzIERvb3Ige1xuICBsb2NrOiBMb2NrO1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gTG9jaykpIGxvY2s6IExvY2spIHsgdGhpcy5sb2NrID0gbG9jazsgfVxufVxuXG4vLyBPbmx5IGF0IHRoaXMgcG9pbnQgTG9jayBpcyBkZWZpbmVkLlxuY2xhc3MgTG9jayB7fVxuXG52YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtEb29yLCBMb2NrXSk7XG52YXIgZG9vciA9IGluamVjdG9yLmdldChEb29yKTtcbmV4cGVjdChkb29yIGluc3RhbmNlb2YgRG9vcikudG9CZSh0cnVlKTtcbmV4cGVjdChkb29yLmxvY2sgaW5zdGFuY2VvZiBMb2NrKS50b0JlKHRydWUpO1xuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIHJlc29sdmVfZm9yd2FyZF9yZWZcbnZhciByZWYgPSBmb3J3YXJkUmVmKCgpID0+IFwicmVmVmFsdWVcIik7XG5leHBlY3QocmVzb2x2ZUZvcndhcmRSZWYocmVmKSkudG9FcXVhbChcInJlZlZhbHVlXCIpO1xuZXhwZWN0KHJlc29sdmVGb3J3YXJkUmVmKFwicmVndWxhclZhbHVlXCIpKS50b0VxdWFsKFwicmVndWxhclZhbHVlXCIpO1xuLy8gI2VuZGRvY3JlZ2lvbiJdfQ==