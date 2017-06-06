import { PromiseWrapper } from 'angular2/src/facade/async';
export class Rectangle {
    constructor(left, top, width, height) {
        this.left = left;
        this.right = left + width;
        this.top = top;
        this.bottom = top + height;
        this.height = height;
        this.width = width;
    }
}
export class Ruler {
    constructor(domAdapter) {
        this.domAdapter = domAdapter;
    }
    measure(el) {
        var clntRect = this.domAdapter.getBoundingClientRect(el.nativeElement);
        // even if getBoundingClientRect is synchronous we use async API in preparation for further
        // changes
        return PromiseWrapper.resolve(new Rectangle(clntRect.left, clntRect.top, clntRect.width, clntRect.height));
    }
}
