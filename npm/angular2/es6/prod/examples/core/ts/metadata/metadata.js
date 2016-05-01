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
