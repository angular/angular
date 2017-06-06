var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Input, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isPresent } from 'angular2/src/facade/lang';
/**
 * Creates and inserts an embedded view based on a prepared `TemplateRef`.
 *
 * ### Syntax
 * - `<template [ngTemplateOutlet]="templateRefExpression"></template>`
 */
export let NgTemplateOutlet = class NgTemplateOutlet {
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    set ngTemplateOutlet(templateRef) {
        if (isPresent(this._insertedViewRef)) {
            this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._insertedViewRef));
        }
        if (isPresent(templateRef)) {
            this._insertedViewRef = this._viewContainerRef.createEmbeddedView(templateRef);
        }
    }
};
__decorate([
    Input(), 
    __metadata('design:type', TemplateRef), 
    __metadata('design:paramtypes', [TemplateRef])
], NgTemplateOutlet.prototype, "ngTemplateOutlet", null);
NgTemplateOutlet = __decorate([
    Directive({ selector: '[ngTemplateOutlet]' }), 
    __metadata('design:paramtypes', [ViewContainerRef])
], NgTemplateOutlet);
