/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Input, NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, getTestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomSanitizer} from '@angular/platform-browser/src/security/dom_sanitization_service';

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });

  describe('no jit', () => { declareTests({useJit: false}); });
}

@Component({selector: 'my-comp', template: ''})
class SecuredComponent {
  ctxProp: any = 'some value';
}

@Directive({selector: '[onPrefixedProp]'})
class OnPrefixDir {
  @Input() onPrefixedProp: any;
  @Input() onclick: any;
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('security integration tests', function() {

    beforeEach(() => {
      TestBed.configureCompiler({useJit: useJit}).configureTestingModule({
        declarations: [
          SecuredComponent,
          OnPrefixDir,
        ]
      });
    });

    let originalLog: (msg: any) => any;
    beforeEach(() => {
      originalLog = getDOM().log;
      getDOM().log = (msg) => { /* disable logging */ };
    });
    afterEach(() => { getDOM().log = originalLog; });

    describe('events', () => {
      it('should disallow binding to attr.on*', () => {
        const template = `<div [attr.onclick]="ctxProp"></div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});

        expect(() => TestBed.createComponent(SecuredComponent))
            .toThrowError(
                /Binding to event attribute 'onclick' is disallowed for security reasons, please use \(click\)=.../);
      });

      it('should disallow binding to on* with NO_ERRORS_SCHEMA', () => {
        const template = `<div [onclick]="ctxProp"></div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}}).configureTestingModule({
          schemas: [NO_ERRORS_SCHEMA]
        });

        expect(() => TestBed.createComponent(SecuredComponent))
            .toThrowError(
                /Binding to event property 'onclick' is disallowed for security reasons, please use \(click\)=.../);
      });

      it('should disallow binding to on* unless it is consumed by a directive', () => {
        const template = `<div [onPrefixedProp]="ctxProp" [onclick]="ctxProp"></div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}}).configureTestingModule({
          schemas: [NO_ERRORS_SCHEMA]
        });

        // should not throw for inputs starting with "on"
        let cmp: ComponentFixture<SecuredComponent>;
        expect(() => cmp = TestBed.createComponent(SecuredComponent)).not.toThrow();

        // must bind to the directive not to the property of the div
        const value = cmp.componentInstance.ctxProp = {};
        cmp.detectChanges();
        const div = cmp.debugElement.children[0];
        expect(div.injector.get(OnPrefixDir).onclick).toBe(value);
        expect(getDOM().getProperty(div.nativeElement, 'onclick')).not.toBe(value);
        expect(getDOM().hasAttribute(div.nativeElement, 'onclick')).toEqual(false);
      });

    });

    describe('safe HTML values', function() {
      it('should not escape values marked as trusted', () => {
        const template = `<a [href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);
        const sanitizer: DomSanitizer = getTestBed().get(DomSanitizer);

        let e = fixture.debugElement.children[0].nativeElement;
        let ci = fixture.componentInstance;
        let trusted = sanitizer.bypassSecurityTrustUrl('javascript:alert(1)');
        ci.ctxProp = trusted;
        fixture.detectChanges();
        expect(getDOM().getProperty(e, 'href')).toEqual('javascript:alert(1)');
      });

      it('should error when using the wrong trusted value', () => {
        const template = `<a [href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);
        const sanitizer: DomSanitizer = getTestBed().get(DomSanitizer);

        let trusted = sanitizer.bypassSecurityTrustScript('javascript:alert(1)');
        let ci = fixture.componentInstance;
        ci.ctxProp = trusted;
        expect(() => fixture.detectChanges()).toThrowError(/Required a safe URL, got a Script/);
      });

      it('should warn when using in string interpolation', () => {
        const template = `<a href="/foo/{{ctxProp}}">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);
        const sanitizer: DomSanitizer = getTestBed().get(DomSanitizer);

        let e = fixture.debugElement.children[0].nativeElement;
        let trusted = sanitizer.bypassSecurityTrustUrl('bar/baz');
        let ci = fixture.componentInstance;
        ci.ctxProp = trusted;
        fixture.detectChanges();
        expect(getDOM().getProperty(e, 'href')).toMatch(/SafeValue(%20| )must(%20| )use/);
      });
    });

    describe('sanitizing', () => {
      it('should escape unsafe attributes', () => {
        const template = `<a [href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        let e = fixture.debugElement.children[0].nativeElement;
        let ci = fixture.componentInstance;
        ci.ctxProp = 'hello';
        fixture.detectChanges();
        // In the browser, reading href returns an absolute URL. On the server side,
        // it just echoes back the property.
        expect(getDOM().getProperty(e, 'href')).toMatch(/.*\/?hello$/);

        ci.ctxProp = 'javascript:alert(1)';
        fixture.detectChanges();
        expect(getDOM().getProperty(e, 'href')).toEqual('unsafe:javascript:alert(1)');
      });

      it('should escape unsafe style values', () => {
        const template = `<div [style.background]="ctxProp">Text</div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        let e = fixture.debugElement.children[0].nativeElement;
        let ci = fixture.componentInstance;
        // Make sure binding harmless values works.
        ci.ctxProp = 'red';
        fixture.detectChanges();
        // In some browsers, this will contain the full background specification, not just
        // the color.
        expect(getDOM().getStyle(e, 'background')).toMatch(/red.*/);

        ci.ctxProp = 'url(javascript:evil())';
        fixture.detectChanges();
        // Updated value gets rejected, no value change.
        expect(getDOM().getStyle(e, 'background')).not.toContain('javascript');
      });

      it('should escape unsafe SVG attributes', () => {
        const template = `<svg:circle [xlink:href]="ctxProp">Text</svg:circle>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});

        expect(() => TestBed.createComponent(SecuredComponent))
            .toThrowError(/Can't bind to 'xlink:href'/);
      });

      it('should escape unsafe HTML values', () => {
        const template = `<div [innerHTML]="ctxProp">Text</div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        let e = fixture.debugElement.children[0].nativeElement;
        let ci = fixture.componentInstance;
        // Make sure binding harmless values works.
        ci.ctxProp = 'some <p>text</p>';
        fixture.detectChanges();
        expect(getDOM().getInnerHTML(e)).toEqual('some <p>text</p>');

        ci.ctxProp = 'ha <script>evil()</script>';
        fixture.detectChanges();
        expect(getDOM().getInnerHTML(e)).toEqual('ha evil()');

        ci.ctxProp = 'also <img src="x" onerror="evil()"> evil';
        fixture.detectChanges();
        expect(getDOM().getInnerHTML(e)).toEqual('also <img src="x"> evil');

        ci.ctxProp = 'also <iframe srcdoc="evil"></iframe> evil';
        fixture.detectChanges();
        expect(getDOM().getInnerHTML(e)).toEqual('also  evil');
      });
    });
  });
}
