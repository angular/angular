var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Json } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
/* @ts2dart_const */
export let JsonPipe = class JsonPipe {
    transform(value) { return Json.stringify(value); }
};
JsonPipe = __decorate([
    Pipe({ name: 'json', pure: false }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], JsonPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBcUIsSUFBSSxFQUFDLE1BQU0sMEJBQTBCO09BQzFELEVBQUMsVUFBVSxFQUErQixJQUFJLEVBQUMsTUFBTSxlQUFlO0FBRTNFOzs7OztHQUtHO0FBQ0gsb0JBQW9CO0FBR3BCO0lBQ0UsU0FBUyxDQUFDLEtBQVUsSUFBWSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUpEO0lBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDakMsVUFBVSxFQUFFOztZQUFBO0FBR1oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgSnNvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGFueSBpbnB1dCB2YWx1ZSB1c2luZyBgSlNPTi5zdHJpbmdpZnlgLiBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvanNvbl9waXBlL2pzb25fcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nSnNvblBpcGUnfVxuICovXG4vKiBAdHMyZGFydF9jb25zdCAqL1xuQFBpcGUoe25hbWU6ICdqc29uJywgcHVyZTogZmFsc2V9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25QaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55KTogc3RyaW5nIHsgcmV0dXJuIEpzb24uc3RyaW5naWZ5KHZhbHVlKTsgfVxufVxuIl19