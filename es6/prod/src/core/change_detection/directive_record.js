import { normalizeBool } from 'angular2/src/facade/lang';
import { isDefaultChangeDetectionStrategy } from './constants';
export class DirectiveIndex {
    constructor(elementIndex, directiveIndex) {
        this.elementIndex = elementIndex;
        this.directiveIndex = directiveIndex;
    }
    get name() { return `${this.elementIndex}_${this.directiveIndex}`; }
}
export class DirectiveRecord {
    constructor({ directiveIndex, callAfterContentInit, callAfterContentChecked, callAfterViewInit, callAfterViewChecked, callOnChanges, callDoCheck, callOnInit, callOnDestroy, changeDetection, outputs } = {}) {
        this.directiveIndex = directiveIndex;
        this.callAfterContentInit = normalizeBool(callAfterContentInit);
        this.callAfterContentChecked = normalizeBool(callAfterContentChecked);
        this.callOnChanges = normalizeBool(callOnChanges);
        this.callAfterViewInit = normalizeBool(callAfterViewInit);
        this.callAfterViewChecked = normalizeBool(callAfterViewChecked);
        this.callDoCheck = normalizeBool(callDoCheck);
        this.callOnInit = normalizeBool(callOnInit);
        this.callOnDestroy = normalizeBool(callOnDestroy);
        this.changeDetection = changeDetection;
        this.outputs = outputs;
    }
    isDefaultChangeDetection() {
        return isDefaultChangeDetectionStrategy(this.changeDetection);
    }
}
