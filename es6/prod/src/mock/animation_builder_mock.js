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
import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { CssAnimationBuilder } from 'angular2/src/animate/css_animation_builder';
import { Animation } from 'angular2/src/animate/animation';
import { BrowserDetails } from 'angular2/src/animate/browser_details';
export let MockAnimationBuilder = class extends AnimationBuilder {
    constructor() {
        super(null);
    }
    css() { return new MockCssAnimationBuilder(); }
};
MockAnimationBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockAnimationBuilder);
class MockCssAnimationBuilder extends CssAnimationBuilder {
    constructor() {
        super(null);
    }
    start(element) { return new MockAnimation(element, this.data); }
}
class MockBrowserAbstraction extends BrowserDetails {
    doesElapsedTimeIncludesDelay() { this.elapsedTimeIncludesDelay = false; }
}
class MockAnimation extends Animation {
    constructor(element, data) {
        super(element, data, new MockBrowserAbstraction());
    }
    wait(callback) { this._callback = callback; }
    flush() {
        this._callback(0);
        this._callback = null;
    }
}
