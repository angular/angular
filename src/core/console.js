'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var Console = (function () {
    function Console() {
    }
    Console.prototype.log = function (message) { lang_1.print(message); };
    Console = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Console);
    return Console;
})();
exports.Console = Console;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NvbnNvbGUudHMiXSwibmFtZXMiOlsiQ29uc29sZSIsIkNvbnNvbGUuY29uc3RydWN0b3IiLCJDb25zb2xlLmxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQscUJBQW9CLDBCQUEwQixDQUFDLENBQUE7QUFFL0M7SUFBQUE7SUFHQUMsQ0FBQ0E7SUFEQ0QscUJBQUdBLEdBQUhBLFVBQUlBLE9BQWVBLElBQVVFLFlBQUtBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRmhERjtRQUFDQSxlQUFVQSxFQUFFQTs7Z0JBR1pBO0lBQURBLGNBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLGVBQU8sVUFFbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbnNvbGUge1xuICBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7IHByaW50KG1lc3NhZ2UpOyB9XG59Il19