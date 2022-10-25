/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {Component, Directive, inject, Type} from '@angular/core';
import {RuntimeErrorCode} from '@angular/core/src/errors';
import {global} from '@angular/core/src/util/global';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';

describe('comment node text escaping', () => {
  // see: https://html.spec.whatwg.org/multipage/syntax.html#comments
  ['>',         // self closing
   '-->',       // standard closing
   '--!>',      // alternate closing
   '<!-- -->',  // embedded comment.
  ].forEach((xssValue) => {
    it('should not be possible to do XSS through comment reflect data when writing: ' + xssValue,
       () => {
         @Component({template: `<div><span *ngIf="xssValue"></span><div>`})
         class XSSComp {
           // ngIf serializes the `xssValue` into a comment for debugging purposes.
           xssValue: string = xssValue + '<script>"evil"</script>';
         }

         TestBed.configureTestingModule({declarations: [XSSComp]});
         const fixture = TestBed.createComponent(XSSComp);
         fixture.detectChanges();
         const div = fixture.nativeElement.querySelector('div') as HTMLElement;
         // Serialize into a string to mimic SSR serialization.
         const html = div.innerHTML;
         // This must be escaped or we have XSS.
         expect(html).not.toContain('--><script');
         // Now parse it back into DOM (from string)
         div.innerHTML = html;
         // Verify that we did not accidentally deserialize the `<script>`
         const script = div.querySelector('script');
         expect(script).toBeFalsy();
       });
  });
});

describe('iframe processing', () => {
  function getErrorMessageRegexp() {
    const errorMessagePart = 'NG0' + RuntimeErrorCode.UNSAFE_IFRAME_ATTRS.toString();
    return new RegExp(errorMessagePart);
  }

  function expectIframeCreationToFail<T>(component: Type<T>, attrName: string) {
    expect(() => {
      let fixture = TestBed.createComponent(component);
      fixture.detectChanges();
    }).toThrowError(getErrorMessageRegexp());
  }

  function expectIframeToBeCreated<T>(
      component: Type<T>, srcAttrToCheck?: string, expectedValue?: string): ComponentFixture<T> {
    let fixture: ComponentFixture<T>;
    expect(() => {
      fixture = TestBed.createComponent(component);
      fixture.detectChanges();
    }).not.toThrow();

    const iframe = fixture!.nativeElement.querySelector('iframe');
    if (srcAttrToCheck) {
      expect(iframe[srcAttrToCheck]).toEqual(expectedValue);
    }

    return fixture!;
  }

  // *Must* be in sync with the `SECURITY_SENSITIVE_ATTRS` list
  // from the `packages/compiler/src/schema/dom_security_schema.ts`.
  const SECURITY_SENSITIVE_ATTRS =
      ['sandbox', 'allow', 'allowfullscreen', 'referrerpolicy', 'loading'];

  const TEST_IFRAME_URL = 'https://angular.io/assets/images/logos/angular/angular.png';

  let oldNgDevMode!: typeof ngDevMode;

  beforeAll(() => {
    oldNgDevMode = ngDevMode;
  });

  afterAll(() => {
    global['ngDevMode'] = oldNgDevMode;
  });

  [true, false].forEach(devModeFlag => {
    beforeAll(() => {
      global['ngDevMode'] = devModeFlag;

      // TestBed and JIT compilation have some dependencies on the ngDevMode state, so we need to
      // reset TestBed to ensure we get a 'clean' JIT compilation under the new rules.
      TestBed.resetTestingModule();
    });

    describe(`with ngDevMode = ${devModeFlag}`, () => {
      SECURITY_SENSITIVE_ATTRS.forEach((securityAttr: string) => {
        ['src', 'srcdoc'].forEach((srcAttr: string) => {
          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${securityAttr}\` as a static attribute)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                  <iframe
                    ${srcAttr}="${TEST_IFRAME_URL}"
                    ${securityAttr}="">
                  </iframe>`,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr);
             });

          it(`should error when a security-sensitive attribute is located *after* the \`${
                 srcAttr}\` ` +
                 `(checking \`${securityAttr}\` as a static attribute, making sure it's ` +
                 `case-insensitive)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                  <iframe
                    ${srcAttr.toUpperCase()}="${TEST_IFRAME_URL}"
                    ${securityAttr.toUpperCase()}="">
                  </iframe>
                 `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr);
             });

          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${securityAttr}\` as a property binding)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template:
                     `<iframe ${srcAttr}="${TEST_IFRAME_URL}" [${securityAttr}]="''"></iframe>`,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr);
             });

          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${
                     securityAttr}\` as a property interpolation)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template:
                     `<iframe ${srcAttr}="${TEST_IFRAME_URL}" ${securityAttr}="{{''}}"></iframe>`,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr);
             });


          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${
                     securityAttr}\` as a property binding, ` +
                 `making sure it's case-insensitive)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                  <iframe
                    ${srcAttr}="${TEST_IFRAME_URL}"
                    [${securityAttr.toUpperCase()}]="''"
                  ></iframe>
                 `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr.toUpperCase());
             });

          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${
                     securityAttr}\` as an attribute binding)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                    <iframe ${srcAttr}="${TEST_IFRAME_URL}" [attr.${securityAttr}]="''"></iframe>
                  `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr);
             });

          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${
                     securityAttr}\` as an attribute interpolation)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                <iframe ${srcAttr}="${TEST_IFRAME_URL}" attr.${securityAttr}="{{''}}"></iframe>
              `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr);
             });

          it(`should error when a security-sensitive attribute is located ` +
                 `*after* the \`${srcAttr}\` (checking \`${
                     securityAttr}\` as an attribute binding, ` +
                 `making sure it's case-insensitive)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                    <iframe
                      ${srcAttr}="${TEST_IFRAME_URL}"
                      [attr.${securityAttr.toUpperCase()}]="''">
                    </iframe>
                  `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp, securityAttr.toUpperCase());
             });

          it(`should work when a security-sensitive attribute is set ` +
                 `before the \`${srcAttr}\` (checking \`${securityAttr}\`)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `<iframe ${securityAttr}="" ${srcAttr}="${TEST_IFRAME_URL}"></iframe>`,
               })
               class IframeComp {
               }

               expectIframeToBeCreated(IframeComp, srcAttr, TEST_IFRAME_URL);
             });

          it(`should error when trying to change a security-sensitive attribute after initial creation ` +
                 `when the \`${srcAttr}\` is set (checking \`${securityAttr}\`)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                    <iframe
                      [${securityAttr}]="securityAttr"
                      [${srcAttr}]="src">
                    </iframe>
                  `,
               })
               class IframeComp {
                 private sanitizer = inject(DomSanitizer);
                 src = this.sanitizeFn(TEST_IFRAME_URL);
                 securityAttr = 'allow-forms';

                 get sanitizeFn() {
                   return srcAttr === 'src' ? this.sanitizer.bypassSecurityTrustResourceUrl :
                                              this.sanitizer.bypassSecurityTrustHtml;
                 }
               }

               const fixture = expectIframeToBeCreated(IframeComp, srcAttr, TEST_IFRAME_URL);
               const component = fixture.componentInstance;

               // Expect to throw if security-sensitive attribute is changed
               // after the `src` or `srcdoc` is set.
               component.securityAttr = 'allow-modals';
               expect(() => fixture.detectChanges()).toThrowError(getErrorMessageRegexp());

               // However, changing the `src` or `srcdoc` is allowed.
               const newUrl = 'https://angular.io/about?group=Angular';
               component.src = component.sanitizeFn(newUrl);
               expect(() => fixture.detectChanges()).not.toThrow();
               expect(fixture.nativeElement.querySelector('iframe')[srcAttr]).toEqual(newUrl);
             });
        });
      });

      it('should error when a directive sets a security-sensitive attribute after setting `src`',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'src': TEST_IFRAME_URL,
               'sandbox': '',
             },
           })
           class IframeDir {
           }
           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: '<iframe dir></iframe>',
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should not error when a directive sets a security-sensitive host attribute on a non-iframe element',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'src': TEST_IFRAME_URL,
               'sandbox': '',
             },
           })
           class Dir {
           }

           @Component({
             standalone: true,
             imports: [Dir],
             selector: 'my-comp',
             template: '<img dir>',
           })
           class NonIframeComp {
           }

           const fixture = TestBed.createComponent(NonIframeComp);
           fixture.detectChanges();

           expect(fixture.nativeElement.firstChild.src).toEqual(TEST_IFRAME_URL);
         });


      it('should error when a security-sensitive attribute is set after `src` on an <iframe> ' +
             'which also has a structural directive (*ngIf)',
         () => {
           @Component({
             standalone: true,
             imports: [NgIf],
             selector: 'my-comp',
             template: `<iframe *ngIf="visible" src="${TEST_IFRAME_URL}" sandbox=""></iframe>`,
           })
           class IframeComp {
             visible = true;
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should error when a security-sensitive attribute is set between `src` and `srcdoc`',
         () => {
           @Component({
             standalone: true,
             selector: 'my-comp',
             template: `<iframe src="${TEST_IFRAME_URL}" sandbox srcdoc="Hi!"></iframe>`,
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should work when a directive sets a security-sensitive attribute before setting `src`',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'sandbox': '',
               'src': TEST_IFRAME_URL,
             },
           })
           class IframeDir {
           }

           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: '<iframe dir></iframe>',
           })
           class IframeComp {
           }

           expectIframeToBeCreated(IframeComp, 'src', TEST_IFRAME_URL);
         });

      it('should error when a directive sets an `src` and ' +
             'there was a security-sensitive attribute set in a template' +
             '(directive attribute after `sandbox`)',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'src': TEST_IFRAME_URL,
             },
           })
           class IframeDir {
           }

           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: '<iframe sandbox dir></iframe>',
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should error when a directive sets a security-sensitive attribute in uppercase ' +
             'and it gets applied before an `src` value',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               '[attr.SANDBOX]': '\'\'',
             },
           })
           class IframeDir {
           }

           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: `<IFRAME dir src="${TEST_IFRAME_URL}"></IFRAME>`,
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'SANDBOX');
         });

      it('should error when a directive sets an `src` and ' +
             'there was a security-sensitive attribute set in a template' +
             '(directive attribute before `sandbox`)',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'src': TEST_IFRAME_URL,
             },
           })
           class IframeDir {
           }

           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: '<iframe dir sandbox></iframe>',
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should work when a directive sets a security-sensitive attribute and ' +
             'there was an `src` attribute set in a template' +
             '(directive attribute after `src`)',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'sandbox': '',
             },
           })
           class IframeDir {
           }

           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: `<iframe src="${TEST_IFRAME_URL}" dir></iframe>`,
           })
           class IframeComp {
           }

           expectIframeToBeCreated(IframeComp, 'src', TEST_IFRAME_URL);
         });

      it('should work when a directive sets a security-sensitive attribute and ' +
             'there was an `src` attribute set in a template' +
             '(directive attribute before `src`)',
         () => {
           @Directive({
             standalone: true,
             selector: '[dir]',
             host: {
               'sandbox': '',
             },
           })
           class IframeDir {
           }

           @Component({
             standalone: true,
             imports: [IframeDir],
             selector: 'my-comp',
             template: `<iframe dir src="${TEST_IFRAME_URL}"></iframe>`,
           })
           class IframeComp {
           }

           expectIframeToBeCreated(IframeComp, 'src', TEST_IFRAME_URL);
         });

      it('should error when a directive that sets a security-sensitive attribute goes ' +
             'after the directive that sets an `src` attribute value',
         () => {
           @Directive({
             standalone: true,
             selector: '[set-src]',
             host: {
               'src': TEST_IFRAME_URL,
             },
           })
           class DirThatSetsSrc {
           }

           @Directive({
             standalone: true,
             selector: '[set-sandbox]',
             host: {
               'sandbox': '',
             },
           })
           class DirThatSetsSandbox {
           }

           @Component({
             standalone: true,
             imports: [DirThatSetsSrc, DirThatSetsSandbox],
             selector: 'my-comp',
             template: '<iframe set-src set-sandbox></iframe>',
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should work when a directive that sets a security-sensitive attribute goes ' +
             'before the directive that sets an `src` attribute value',
         () => {
           @Directive({
             standalone: true,
             selector: '[set-src]',
             host: {
               'src': TEST_IFRAME_URL,
             },
           })
           class DirThatSetsSrc {
           }

           @Directive({
             standalone: true,
             selector: '[set-sandbox]',
             host: {
               'sandbox': '',
             },
           })
           class DirThatSetsSandbox {
           }

           @Component({
             standalone: true,
             imports: [DirThatSetsSandbox, DirThatSetsSrc],
             selector: 'my-comp',
             // Important note: even though the `set-sandbox` goes after the `set-src`,
             // the directive matching order (thus the order of host attributes) is
             // based on the imports order, so the `sandbox` gets set first and the `src` second.
             template: '<iframe set-src set-sandbox></iframe>',
           })
           class IframeComp {
           }

           expectIframeToBeCreated(IframeComp, 'src', TEST_IFRAME_URL);
         });

      it(`should error when a security-sensitive attribute is located after the \`src\` ` +
             `on an <iframe> with the tag name defined in uppercase`,
         () => {
           @Component({
             standalone: true,
             selector: 'my-comp',
             template: `<IFRAME src="${TEST_IFRAME_URL}" sandbox=""></IFRAME>`,
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should error when a directive that sets a security-sensitive attribute has ' +
             'a host directive that sets an `src` attribute value',
         () => {
           @Directive({
             standalone: true,
             selector: '[set-src-dir]',
             host: {
               'src': TEST_IFRAME_URL,
             },
           })
           class DirThatSetsSrc {
           }

           @Directive({
             standalone: true,
             selector: '[dir]',
             hostDirectives: [DirThatSetsSrc],
             host: {
               'sandbox': '',
             },
           })
           class DirThatSetsSandbox {
           }

           @Component({
             standalone: true,
             imports: [DirThatSetsSandbox],
             selector: 'my-comp',
             template: '<iframe dir></iframe>',
           })
           class IframeComp {
           }

           // Note: host bindings of the `DirThatSetsSrc` (thus setting the `src`)
           // were invoked first, since this is a host directive of the `DirThatSetsSandbox`
           // (in which case, the `sandbox` is set afterwards, which causes an error).
           expectIframeCreationToFail(IframeComp, 'sandbox');
         });

      it('should work when a directive that sets an `src` has ' +
             'a host directive that sets a security-sensitive attribute value',
         () => {
           @Directive({
             standalone: true,
             selector: '[set-sandbox-dir]',
             host: {
               'sandbox': '',
             },
           })
           class DirThatSetsSandbox {
           }

           @Directive({
             standalone: true,
             selector: '[dir]',
             hostDirectives: [DirThatSetsSandbox],
             host: {
               'src': TEST_IFRAME_URL,
             },
           })
           class DirThatSetsSrc {
           }

           @Component({
             standalone: true,
             imports: [DirThatSetsSrc],
             selector: 'my-comp',
             template: '<iframe dir></iframe>',
           })
           class IframeComp {
           }

           // Note: host bindings of the `DirThatSetsSandbox` (thus setting the `sandbox`)
           // were invoked first, since this is a host directive of the `DirThatSetsSrc`
           // (in which case, the `src` is set afterwards, which is ok).
           expectIframeToBeCreated(IframeComp, 'src', TEST_IFRAME_URL);
         });
    });
  });
});
