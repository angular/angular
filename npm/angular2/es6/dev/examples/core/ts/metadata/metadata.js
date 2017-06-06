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
import { Component, Attribute, Directive, Pipe } from 'angular2/core';
var CustomDirective;
// #docregion component
let Greet = class Greet {
    constructor() {
        this.name = 'World';
    }
};
Greet = __decorate([
    Component({ selector: 'greet', template: 'Hello {{name}}!', directives: [CustomDirective] }), 
    __metadata('design:paramtypes', [])
], Greet);
// #enddocregion
// #docregion attributeFactory
let Page = class Page {
    constructor(title) {
        this.title = title;
    }
};
Page = __decorate([
    Component({ selector: 'page', template: 'Title: {{title}}' }),
    __param(0, Attribute('title')), 
    __metadata('design:paramtypes', [String])
], Page);
// #enddocregion
// #docregion attributeMetadata
let InputAttrDirective = class InputAttrDirective {
    constructor(type) {
        // type would be 'text' in this example
    }
};
InputAttrDirective = __decorate([
    Directive({ selector: 'input' }),
    __param(0, Attribute('type')), 
    __metadata('design:paramtypes', [String])
], InputAttrDirective);
// #enddocregion
// #docregion directive
let InputDirective = class InputDirective {
    constructor() {
        // Add some logic.
    }
};
InputDirective = __decorate([
    Directive({ selector: 'input' }), 
    __metadata('design:paramtypes', [])
], InputDirective);
// #enddocregion
// #docregion pipe
let Lowercase = class Lowercase {
    transform(v, args) { return v.toLowerCase(); }
};
Lowercase = __decorate([
    Pipe({ name: 'lowercase' }), 
    __metadata('design:paramtypes', [])
], Lowercase);
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9leGFtcGxlcy9jb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZTtBQUVuRSxJQUFJLGVBQXlCLENBQUM7QUFFOUIsdUJBQXVCO0FBRXZCO0lBQUE7UUFDRSxTQUFJLEdBQVcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7QUFBRCxDQUFDO0FBSEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBQyxDQUFDOztTQUFBO0FBSTNGLGdCQUFnQjtBQUVoQiw4QkFBOEI7QUFFOUI7SUFFRSxZQUFnQyxLQUFhO1FBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFBQyxDQUFDO0FBQ3hFLENBQUM7QUFKRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFDLENBQUM7ZUFHN0MsU0FBUyxDQUFDLE9BQU8sQ0FBQzs7UUFIMkI7QUFLNUQsZ0JBQWdCO0FBRWhCLCtCQUErQjtBQUUvQjtJQUNFLFlBQStCLElBQVk7UUFDekMsdUNBQXVDO0lBQ3pDLENBQUM7QUFDSCxDQUFDO0FBTEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUM7ZUFFaEIsU0FBUyxDQUFDLE1BQU0sQ0FBQzs7c0JBRkQ7QUFNL0IsZ0JBQWdCO0FBRWhCLHVCQUF1QjtBQUV2QjtJQUNFO1FBQ0Usa0JBQWtCO0lBQ3BCLENBQUM7QUFDSCxDQUFDO0FBTEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUM7O2tCQUFBO0FBTS9CLGdCQUFnQjtBQUVoQixrQkFBa0I7QUFFbEI7SUFDRSxTQUFTLENBQUMsQ0FBUyxFQUFFLElBQVcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBSEQ7SUFBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLENBQUM7O2FBQUE7QUFJMUIsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxudmFyIEN1c3RvbURpcmVjdGl2ZTogRnVuY3Rpb247XG5cbi8vICNkb2NyZWdpb24gY29tcG9uZW50XG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ2dyZWV0JywgdGVtcGxhdGU6ICdIZWxsbyB7e25hbWV9fSEnLCBkaXJlY3RpdmVzOiBbQ3VzdG9tRGlyZWN0aXZlXX0pXG5jbGFzcyBHcmVldCB7XG4gIG5hbWU6IHN0cmluZyA9ICdXb3JsZCc7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gYXR0cmlidXRlRmFjdG9yeVxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdwYWdlJywgdGVtcGxhdGU6ICdUaXRsZToge3t0aXRsZX19J30pXG5jbGFzcyBQYWdlIHtcbiAgdGl0bGU6IHN0cmluZztcbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgndGl0bGUnKSB0aXRsZTogc3RyaW5nKSB7IHRoaXMudGl0bGUgPSB0aXRsZTsgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIGF0dHJpYnV0ZU1ldGFkYXRhXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2lucHV0J30pXG5jbGFzcyBJbnB1dEF0dHJEaXJlY3RpdmUge1xuICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKCd0eXBlJykgdHlwZTogc3RyaW5nKSB7XG4gICAgLy8gdHlwZSB3b3VsZCBiZSAndGV4dCcgaW4gdGhpcyBleGFtcGxlXG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBkaXJlY3RpdmVcbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnaW5wdXQnfSlcbmNsYXNzIElucHV0RGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gQWRkIHNvbWUgbG9naWMuXG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBwaXBlXG5AUGlwZSh7bmFtZTogJ2xvd2VyY2FzZSd9KVxuY2xhc3MgTG93ZXJjYXNlIHtcbiAgdHJhbnNmb3JtKHY6IHN0cmluZywgYXJnczogYW55W10pIHsgcmV0dXJuIHYudG9Mb3dlckNhc2UoKTsgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuIl19