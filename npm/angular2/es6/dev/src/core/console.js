var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { print, warn } from 'angular2/src/facade/lang';
// Note: Need to rename warn as in Dart
// class members and imports can't use the same name.
let _warnImpl = warn;
export let Console = class Console {
    log(message) { print(message); }
    // Note: for reporting errors use `DOM.logError()` as it is platform specific
    warn(message) { _warnImpl(message); }
};
Console = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], Console);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2NvbnNvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLE1BQU0sMEJBQTBCO0FBRXBELHVDQUF1QztBQUN2QyxxREFBcUQ7QUFDckQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBR3JCO0lBQ0UsR0FBRyxDQUFDLE9BQWUsSUFBVSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLDZFQUE2RTtJQUM3RSxJQUFJLENBQUMsT0FBZSxJQUFVLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUxEO0lBQUMsVUFBVSxFQUFFOztXQUFBO0FBS1oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7cHJpbnQsIHdhcm59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8vIE5vdGU6IE5lZWQgdG8gcmVuYW1lIHdhcm4gYXMgaW4gRGFydFxuLy8gY2xhc3MgbWVtYmVycyBhbmQgaW1wb3J0cyBjYW4ndCB1c2UgdGhlIHNhbWUgbmFtZS5cbmxldCBfd2FybkltcGwgPSB3YXJuO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29uc29sZSB7XG4gIGxvZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHsgcHJpbnQobWVzc2FnZSk7IH1cbiAgLy8gTm90ZTogZm9yIHJlcG9ydGluZyBlcnJvcnMgdXNlIGBET00ubG9nRXJyb3IoKWAgYXMgaXQgaXMgcGxhdGZvcm0gc3BlY2lmaWNcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHsgX3dhcm5JbXBsKG1lc3NhZ2UpOyB9XG59XG4iXX0=