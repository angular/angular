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
    constructor({ directiveIndex, callAfterContentInit, callAfterContentChecked, callAfterViewInit, callAfterViewChecked, callOnChanges, callDoCheck, callOnInit, changeDetection } = {}) {
        this.directiveIndex = directiveIndex;
        this.callAfterContentInit = normalizeBool(callAfterContentInit);
        this.callAfterContentChecked = normalizeBool(callAfterContentChecked);
        this.callOnChanges = normalizeBool(callOnChanges);
        this.callAfterViewInit = normalizeBool(callAfterViewInit);
        this.callAfterViewChecked = normalizeBool(callAfterViewChecked);
        this.callDoCheck = normalizeBool(callDoCheck);
        this.callOnInit = normalizeBool(callOnInit);
        this.changeDetection = changeDetection;
    }
    isDefaultChangeDetection() {
        return isDefaultChangeDetectionStrategy(this.changeDetection);
    }
}
//# sourceMappingURL=directive_record.js.map