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
import { CssAnimationBuilder } from './css_animation_builder';
import { BrowserDetails } from './browser_details';
export let AnimationBuilder = class {
    /**
     * Used for DI
     * @param browserDetails
     */
    constructor(browserDetails) {
        this.browserDetails = browserDetails;
    }
    /**
     * Creates a new CSS Animation
     * @returns {CssAnimationBuilder}
     */
    css() { return new CssAnimationBuilder(this.browserDetails); }
};
AnimationBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [BrowserDetails])
], AnimationBuilder);
