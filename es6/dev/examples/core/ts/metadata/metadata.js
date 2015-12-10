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
let Greet = class {
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
let Page = class {
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
let InputAttrDirective = class {
    constructor(type) {
        // type would be 'text' in this example
    }
};
InputAttrDirective = __decorate([
    Directive({ selector: 'input' }),
    __param(0, Attribute('type')), 
    __metadata('design:paramtypes', [Object])
], InputAttrDirective);
// #enddocregion
// #docregion directive
let InputDirective = class {
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
let Lowercase = class {
    transform(v, args) { return v.toLowerCase(); }
};
Lowercase = __decorate([
    Pipe({ name: 'lowercase' }), 
    __metadata('design:paramtypes', [])
], Lowercase);
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbIkdyZWV0IiwiR3JlZXQuY29uc3RydWN0b3IiLCJQYWdlIiwiUGFnZS5jb25zdHJ1Y3RvciIsIklucHV0QXR0ckRpcmVjdGl2ZSIsIklucHV0QXR0ckRpcmVjdGl2ZS5jb25zdHJ1Y3RvciIsIklucHV0RGlyZWN0aXZlIiwiSW5wdXREaXJlY3RpdmUuY29uc3RydWN0b3IiLCJMb3dlcmNhc2UiLCJMb3dlcmNhc2UudHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWU7QUFFbkUsSUFBSSxlQUFlLENBQUM7QUFFcEIsdUJBQXVCO0FBQ3ZCO0lBQUFBO1FBRUVDLFNBQUlBLEdBQVdBLE9BQU9BLENBQUNBO0lBQ3pCQSxDQUFDQTtBQUFERCxDQUFDQTtBQUhEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUMsQ0FBQzs7VUFHMUY7QUFDRCxnQkFBZ0I7QUFFaEIsOEJBQThCO0FBQzlCO0lBR0VFLFlBQWdDQSxLQUFhQTtRQUFJQyxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUFDQSxDQUFDQTtBQUN4RUQsQ0FBQ0E7QUFKRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFDLENBQUM7SUFHOUMsV0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7O1NBQ2hDO0FBQ0QsZ0JBQWdCO0FBRWhCLCtCQUErQjtBQUMvQjtJQUVFRSxZQUErQkEsSUFBSUE7UUFDakNDLHVDQUF1Q0E7SUFDekNBLENBQUNBO0FBQ0hELENBQUNBO0FBTEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFFakIsV0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7O3VCQUcvQjtBQUNELGdCQUFnQjtBQUVoQix1QkFBdUI7QUFDdkI7SUFFRUU7UUFDRUMsa0JBQWtCQTtJQUNwQkEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFMRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQzs7bUJBSzlCO0FBQ0QsZ0JBQWdCO0FBRWhCLGtCQUFrQjtBQUNsQjtJQUVFRSxTQUFTQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxJQUFJQyxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNoREQsQ0FBQ0E7QUFIRDtJQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FBQzs7Y0FHekI7QUFDRCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgQXR0cmlidXRlLCBEaXJlY3RpdmUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG52YXIgQ3VzdG9tRGlyZWN0aXZlO1xuXG4vLyAjZG9jcmVnaW9uIGNvbXBvbmVudFxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdncmVldCcsIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJywgZGlyZWN0aXZlczogW0N1c3RvbURpcmVjdGl2ZV19KVxuY2xhc3MgR3JlZXQge1xuICBuYW1lOiBzdHJpbmcgPSAnV29ybGQnO1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIGF0dHJpYnV0ZUZhY3RvcnlcbkBDb21wb25lbnQoe3NlbGVjdG9yOiAncGFnZScsIHRlbXBsYXRlOiAnVGl0bGU6IHt7dGl0bGV9fSd9KVxuY2xhc3MgUGFnZSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ3RpdGxlJykgdGl0bGU6IHN0cmluZykgeyB0aGlzLnRpdGxlID0gdGl0bGU7IH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBhdHRyaWJ1dGVNZXRhZGF0YVxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdpbnB1dCd9KVxuY2xhc3MgSW5wdXRBdHRyRGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgndHlwZScpIHR5cGUpIHtcbiAgICAvLyB0eXBlIHdvdWxkIGJlICd0ZXh0JyBpbiB0aGlzIGV4YW1wbGVcbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIGRpcmVjdGl2ZVxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdpbnB1dCd9KVxuY2xhc3MgSW5wdXREaXJlY3RpdmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvLyBBZGQgc29tZSBsb2dpYy5cbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIHBpcGVcbkBQaXBlKHtuYW1lOiAnbG93ZXJjYXNlJ30pXG5jbGFzcyBMb3dlcmNhc2Uge1xuICB0cmFuc2Zvcm0odiwgYXJncykgeyByZXR1cm4gdi50b0xvd2VyQ2FzZSgpOyB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG4iXX0=