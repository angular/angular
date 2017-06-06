'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
// Note: Need to rename warn as in Dart
// class members and imports can't use the same name.
var _warnImpl = lang_1.warn;
var Console = (function () {
    function Console() {
    }
    Console.prototype.log = function (message) { lang_1.print(message); };
    // Note: for reporting errors use `DOM.logError()` as it is platform specific
    Console.prototype.warn = function (message) { _warnImpl(message); };
    Console = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Console);
    return Console;
}());
exports.Console = Console;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2NvbnNvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUEwQiwwQkFBMEIsQ0FBQyxDQUFBO0FBRXJELHVDQUF1QztBQUN2QyxxREFBcUQ7QUFDckQsSUFBSSxTQUFTLEdBQUcsV0FBSSxDQUFDO0FBR3JCO0lBQUE7SUFJQSxDQUFDO0lBSEMscUJBQUcsR0FBSCxVQUFJLE9BQWUsSUFBVSxZQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLDZFQUE2RTtJQUM3RSxzQkFBSSxHQUFKLFVBQUssT0FBZSxJQUFVLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFKckQ7UUFBQyxlQUFVLEVBQUU7O2VBQUE7SUFLYixjQUFDO0FBQUQsQ0FBQyxBQUpELElBSUM7QUFKWSxlQUFPLFVBSW5CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7cHJpbnQsIHdhcm59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8vIE5vdGU6IE5lZWQgdG8gcmVuYW1lIHdhcm4gYXMgaW4gRGFydFxuLy8gY2xhc3MgbWVtYmVycyBhbmQgaW1wb3J0cyBjYW4ndCB1c2UgdGhlIHNhbWUgbmFtZS5cbmxldCBfd2FybkltcGwgPSB3YXJuO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29uc29sZSB7XG4gIGxvZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHsgcHJpbnQobWVzc2FnZSk7IH1cbiAgLy8gTm90ZTogZm9yIHJlcG9ydGluZyBlcnJvcnMgdXNlIGBET00ubG9nRXJyb3IoKWAgYXMgaXQgaXMgcGxhdGZvcm0gc3BlY2lmaWNcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHsgX3dhcm5JbXBsKG1lc3NhZ2UpOyB9XG59XG4iXX0=