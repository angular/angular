/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Component, Directive, HostBinding, Input, NO_ERRORS_SCHEMA, ɵivyEnabled as ivyEnabled} from '@angular/core';
import {ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser/src/security/dom_sanitization_service';
import {modifiedInIvy, onlyInIvy} from '@angular/private/testing';

{
  if (ivyEnabled) {
    describe('ivy', () => {
      declareTests();
    });
  } else {
    describe('jit', () => {
      declareTests({useJit: true});
    });
    describe('no jit', () => {
      declareTests({useJit: false});
    });
  }
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

function declareTests(config?: {useJit: boolean}) {
  describe('security integration tests', function() {
    beforeEach(() => {
      TestBed.configureCompiler({...config}).configureTestingModule({
        declarations: [
          SecuredComponent,
          OnPrefixDir,
        ]
      });
    });

    beforeEach(() => {
      // Disable logging for these tests.
      spyOn(console, 'log').and.callFake(() => {});
    });

    describe('events', () => {
      modifiedInIvy('on-prefixed attributes validation happens at runtime in Ivy')
          .it('should disallow binding to attr.on*', () => {
            const template = `<div [attr.onclick]="ctxProp"></div>`;
            TestBed.overrideComponent(SecuredComponent, {set: {template}});

            expect(() => TestBed.createComponent(SecuredComponent))
                .toThrowError(
                    /Binding to event attribute 'onclick' is disallowed for security reasons, please use \(click\)=.../);
          });

      // this test is similar to the previous one, but since on-prefixed attributes validation now
      // happens at runtime, we need to invoke change detection to trigger elementProperty call
      onlyInIvy('on-prefixed attributes validation happens at runtime in Ivy')
          .it('should disallow binding to attr.on*', () => {
            const template = `<div [attr.onclick]="ctxProp"></div>`;
            TestBed.overrideComponent(SecuredComponent, {set: {template}});

            expect(() => {
              const cmp = TestBed.createComponent(SecuredComponent);
              cmp.detectChanges();
            })
                .toThrowError(
                    /Binding to event attribute 'onclick' is disallowed for security reasons, please use \(click\)=.../);
          });

      modifiedInIvy('on-prefixed attributes validation happens at runtime in Ivy')
          .it('should disallow binding to on* with NO_ERRORS_SCHEMA', () => {
            const template = `<div [onclick]="ctxProp"></div>`;
            TestBed.overrideComponent(SecuredComponent, {set: {template}}).configureTestingModule({
              schemas: [NO_ERRORS_SCHEMA]
            });

            expect(() => TestBed.createComponent(SecuredComponent))
                .toThrowError(
                    /Binding to event property 'onclick' is disallowed for security reasons, please use \(click\)=.../);
          });

      // this test is similar to the previous one, but since on-prefixed attributes validation now
      // happens at runtime, we need to invoke change detection to trigger elementProperty call
      onlyInIvy('on-prefixed attributes validation happens at runtime in Ivy')
          .it('should disallow binding to on* with NO_ERRORS_SCHEMA', () => {
            const template = `<div [onclick]="ctxProp"></div>`;
            TestBed.overrideComponent(SecuredComponent, {set: {template}}).configureTestingModule({
              schemas: [NO_ERRORS_SCHEMA]
            });

            expect(() => {
              const cmp = TestBed.createComponent(SecuredComponent);
              cmp.detectChanges();
            })
                .toThrowError(
                    /Binding to event property 'onclick' is disallowed for security reasons, please use \(click\)=.../);
          });

      it('should disallow binding to on* unless it is consumed by a directive', () => {
        const template = `<div [onPrefixedProp]="ctxProp" [onclick]="ctxProp"></div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}}).configureTestingModule({
          schemas: [NO_ERRORS_SCHEMA]
        });

        // should not throw for inputs starting with "on"
        let cmp: ComponentFixture<SecuredComponent> = undefined!;
        expect(() => cmp = TestBed.createComponent(SecuredComponent)).not.toThrow();

        // must bind to the directive not to the property of the div
        const value = cmp.componentInstance.ctxProp = {};
        cmp.detectChanges();
        const div = cmp.debugElement.children[0];
        expect(div.injector.get(OnPrefixDir).onclick).toBe(value);
        expect(div.nativeElement.onclick).not.toBe(value);
        expect(div.nativeElement.hasAttribute('onclick')).toEqual(false);
      });
    });

    describe('safe HTML values', function() {
      it('should not escape values marked as trusted', () => {
        const template = `<a [href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);
        const sanitizer: DomSanitizer = getTestBed().get(DomSanitizer);

        const e = fixture.debugElement.children[0].nativeElement;
        const ci = fixture.componentInstance;
        const trusted = sanitizer.bypassSecurityTrustUrl('javascript:alert(1)');
        ci.ctxProp = trusted;
        fixture.detectChanges();
        expect(e.getAttribute('href')).toEqual('javascript:alert(1)');
      });

      it('should error when using the wrong trusted value', () => {
        const template = `<a [href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);
        const sanitizer: DomSanitizer = getTestBed().get(DomSanitizer);

        const trusted = sanitizer.bypassSecurityTrustScript('javascript:alert(1)');
        const ci = fixture.componentInstance;
        ci.ctxProp = trusted;
        expect(() => fixture.detectChanges()).toThrowError(/Required a safe URL, got a Script/);
      });

      it('should warn when using in string interpolation', () => {
        const template = `<a href="/foo/{{ctxProp}}">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);
        const sanitizer: DomSanitizer = getTestBed().get(DomSanitizer);

        const e = fixture.debugElement.children[0].nativeElement;
        const trusted = sanitizer.bypassSecurityTrustUrl('bar/baz');
        const ci = fixture.componentInstance;
        ci.ctxProp = trusted;
        fixture.detectChanges();
        expect(e.href).toMatch(/SafeValue(%20| )must(%20| )use/);
      });
    });

    describe('sanitizing', () => {
      function checkEscapeOfHrefProperty(fixture: ComponentFixture<any>) {
        const e = fixture.debugElement.children[0].nativeElement;
        const ci = fixture.componentInstance;
        ci.ctxProp = 'hello';
        fixture.detectChanges();
        expect(e.getAttribute('href')).toMatch(/.*\/?hello$/);

        ci.ctxProp = 'javascript:alert(1)';
        fixture.detectChanges();
        expect(e.getAttribute('href')).toEqual('unsafe:javascript:alert(1)');
      }

      it('should escape unsafe properties', () => {
        const template = `<a [href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        checkEscapeOfHrefProperty(fixture);
      });

      it('should escape unsafe attributes', () => {
        const template = `<a [attr.href]="ctxProp">Link Title</a>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        checkEscapeOfHrefProperty(fixture);
      });

      it('should escape unsafe properties if they are used in host bindings', () => {
        @Directive({selector: '[dirHref]'})
        class HrefDirective {
          // TODO(issue/24571): remove '!'.
          @HostBinding('href') @Input() dirHref!: string;
        }

        const template = `<a [dirHref]="ctxProp">Link Title</a>`;
        TestBed.configureTestingModule({declarations: [HrefDirective]});
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        checkEscapeOfHrefProperty(fixture);
      });

      it('should escape unsafe attributes if they are used in host bindings', () => {
        @Directive({selector: '[dirHref]'})
        class HrefDirective {
          // TODO(issue/24571): remove '!'.
          @HostBinding('attr.href') @Input() dirHref!: string;
        }

        const template = `<a [dirHref]="ctxProp">Link Title</a>`;
        TestBed.configureTestingModule({declarations: [HrefDirective]});
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        checkEscapeOfHrefProperty(fixture);
      });

      modifiedInIvy('Unknown property error thrown during update mode, not creation mode')
          .it('should escape unsafe SVG attributes', () => {
            const template = `<svg:circle [xlink:href]="ctxProp">Text</svg:circle>`;
            TestBed.overrideComponent(SecuredComponent, {set: {template}});

            expect(() => TestBed.createComponent(SecuredComponent))
                .toThrowError(/Can't bind to 'xlink:href'/);
          });

      onlyInIvy('Unknown property logs an error message instead of throwing')
          .it('should escape unsafe SVG attributes', () => {
            const template = `<svg:circle [xlink:href]="ctxProp">Text</svg:circle>`;
            TestBed.overrideComponent(SecuredComponent, {set: {template}});

            const spy = spyOn(console, 'error');
            const fixture = TestBed.createComponent(SecuredComponent);
            fixture.detectChanges();
            expect(spy.calls.mostRecent().args[0]).toMatch(/Can't bind to 'xlink:href'/);
          });

      it('should escape unsafe HTML values', () => {
        const template = `<div [innerHTML]="ctxProp">Text</div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});
        const fixture = TestBed.createComponent(SecuredComponent);

        const e = fixture.debugElement.children[0].nativeElement;
        const ci = fixture.componentInstance;
        // Make sure binding harmless values works.
        ci.ctxProp = 'some <p>text</p>';
        fixture.detectChanges();
        expect(e.innerHTML).toEqual('some <p>text</p>');

        ci.ctxProp = 'ha <script>evil()</script>';
        fixture.detectChanges();
        expect(e.innerHTML).toEqual('ha ');

        ci.ctxProp = 'also <img src="x" onerror="evil()"> evil';
        fixture.detectChanges();
        expect(e.innerHTML).toEqual('also <img src="x"> evil');

        ci.ctxProp = 'also <iframe srcdoc="evil"></iframe> evil';
        fixture.detectChanges();
        expect(e.innerHTML).toEqual('also  evil');
      });
    });

    onlyInIvy('Trusted Types are only supported in Ivy').describe('translation', () => {
      it('should throw error on security-sensitive attributes with constant values', () => {
        const template = `<iframe srcdoc="foo" i18n-srcdoc></iframe>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});

        expect(() => TestBed.createComponent(SecuredComponent))
            .toThrowError(/Translating attribute 'srcdoc' is disallowed for security reasons./);
      });

      it('should throw error on security-sensitive attributes with interpolated values', () => {
        const template = `<object i18n-data data="foo{{bar}}baz"></object>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});

        expect(() => TestBed.createComponent(SecuredComponent))
            .toThrowError(/Translating attribute 'data' is disallowed for security reasons./);
      });

      it('should throw error on security-sensitive attributes with bound values', () => {
        const template = `<div [innerHTML]="foo" i18n-innerHTML></div>`;
        TestBed.overrideComponent(SecuredComponent, {set: {template}});

        expect(() => TestBed.createComponent(SecuredComponent))
            .toThrowError(/Translating attribute 'innerHTML' is disallowed for security reasons./);
      });
    });
  });
}
