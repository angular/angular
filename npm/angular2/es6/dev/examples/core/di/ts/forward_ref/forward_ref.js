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
import { Inject, ReflectiveInjector, forwardRef, resolveForwardRef } from 'angular2/core';
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
var injector = ReflectiveInjector.resolveAndCreate([Door, Lock]);
var door = injector.get(Door);
expect(door instanceof Door).toBe(true);
expect(door.lock instanceof Lock).toBe(true);
// #enddocregion
// #docregion resolve_forward_ref
var ref = forwardRef(() => "refValue");
expect(resolveForwardRef(ref)).toEqual("refValue");
expect(resolveForwardRef("regularValue")).toEqual("regularValue");
// #enddocregion 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yd2FyZF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9leGFtcGxlcy9jb3JlL2RpL3RzL2ZvcndhcmRfcmVmL2ZvcndhcmRfcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQ0wsTUFBTSxFQUNOLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsaUJBQWlCLEVBRWxCLE1BQU0sZUFBZTtBQUV0Qiw0QkFBNEI7QUFDNUIsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFDakMsZ0JBQWdCO0FBRWhCLHlCQUF5QjtBQUN6QjtJQUVFLFlBQTRDLElBQVU7UUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUFDLENBQUM7QUFDL0UsQ0FBQztBQURhO2VBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDOztRQUFBO0FBRzdDLHNDQUFzQztBQUN0QztBQUFZLENBQUM7QUFFYixJQUFJLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUIsTUFBTSxDQUFDLElBQUksWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLGdCQUFnQjtBQUVoQixpQ0FBaUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsRSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBJbmplY3QsXG4gIFJlZmxlY3RpdmVJbmplY3RvcixcbiAgZm9yd2FyZFJlZixcbiAgcmVzb2x2ZUZvcndhcmRSZWYsXG4gIEZvcndhcmRSZWZGblxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuLy8gI2RvY3JlZ2lvbiBmb3J3YXJkX3JlZl9mblxudmFyIHJlZiA9IGZvcndhcmRSZWYoKCkgPT4gTG9jayk7XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gZm9yd2FyZF9yZWZcbmNsYXNzIERvb3Ige1xuICBsb2NrOiBMb2NrO1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gTG9jaykpIGxvY2s6IExvY2spIHsgdGhpcy5sb2NrID0gbG9jazsgfVxufVxuXG4vLyBPbmx5IGF0IHRoaXMgcG9pbnQgTG9jayBpcyBkZWZpbmVkLlxuY2xhc3MgTG9jayB7fVxuXG52YXIgaW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRG9vciwgTG9ja10pO1xudmFyIGRvb3IgPSBpbmplY3Rvci5nZXQoRG9vcik7XG5leHBlY3QoZG9vciBpbnN0YW5jZW9mIERvb3IpLnRvQmUodHJ1ZSk7XG5leHBlY3QoZG9vci5sb2NrIGluc3RhbmNlb2YgTG9jaykudG9CZSh0cnVlKTtcbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiByZXNvbHZlX2ZvcndhcmRfcmVmXG52YXIgcmVmID0gZm9yd2FyZFJlZigoKSA9PiBcInJlZlZhbHVlXCIpO1xuZXhwZWN0KHJlc29sdmVGb3J3YXJkUmVmKHJlZikpLnRvRXF1YWwoXCJyZWZWYWx1ZVwiKTtcbmV4cGVjdChyZXNvbHZlRm9yd2FyZFJlZihcInJlZ3VsYXJWYWx1ZVwiKSkudG9FcXVhbChcInJlZ3VsYXJWYWx1ZVwiKTtcbi8vICNlbmRkb2NyZWdpb24iXX0=