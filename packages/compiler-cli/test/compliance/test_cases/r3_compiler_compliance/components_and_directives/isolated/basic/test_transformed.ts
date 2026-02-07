import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestCmp)(); };
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never> = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TestCmp, selectors: [["test-cmp"]], decls: 2, vars: 0, template: function TestCmp_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div");
            i0.ɵɵtext(1, "Hello World");
            i0.ɵɵdomElementEnd();
        } }, encapsulation: 2 });
}
…
