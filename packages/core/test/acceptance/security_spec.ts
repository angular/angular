/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {Component, Directive, inject, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
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
    const errorMessagePart = 'NG0' + Math.abs(RuntimeErrorCode.UNSAFE_IFRAME_ATTRS).toString();
    return new RegExp(errorMessagePart);
  }

  function ensureNoIframePresent(fixture?: ComponentFixture<unknown>) {
    // Note: a `fixture` may not exist in case an error was thrown at creation time.
    const iframe = fixture?.nativeElement.querySelector('iframe');
    expect(!!iframe).toBeFalse();
  }

  function expectIframeCreationToFail<T>(component: Type<T>): ComponentFixture<T> {
    let fixture: ComponentFixture<T>|undefined;
    expect(() => {
      fixture = TestBed.createComponent(component);
      fixture.detectChanges();
    }).toThrowError(getErrorMessageRegexp());

    ensureNoIframePresent(fixture);
    return fixture!;
  }

  function expectIframeToBeCreated<T>(
      component: Type<T>, attrsToCheck: {[key: string]: string}): ComponentFixture<T> {
    let fixture: ComponentFixture<T>;
    expect(() => {
      fixture = TestBed.createComponent(component);
      fixture.detectChanges();
    }).not.toThrow();

    const iframe = fixture!.nativeElement.querySelector('iframe');
    for (const [attrName, attrValue] of Object.entries(attrsToCheck)) {
      expect(iframe[attrName]).toEqual(attrValue);
    }

    return fixture!;
  }

  // *Must* be in sync with the `SECURITY_SENSITIVE_ATTRS` list
  // from the `packages/compiler/src/schema/dom_security_schema.ts`.
  const SECURITY_SENSITIVE_ATTRS =
      ['sandbox', 'allow', 'allowFullscreen', 'referrerPolicy', 'csp', 'fetchPriority'];

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
          it(`should work when a security-sensitive attribute is set ` +
                 `as a static attribute (checking \`${securityAttr}\`)`,
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

               expectIframeToBeCreated(IframeComp, {[srcAttr]: TEST_IFRAME_URL});
             });

          it(`should work when a security-sensitive attribute is set ` +
                 `as a static attribute (checking \`${securityAttr}\` and ` +
                 `making sure it's case-insensitive)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                  <iframe
                    ${srcAttr}="${TEST_IFRAME_URL}"
                    ${securityAttr.toUpperCase()}="">
                  </iframe>`,
               })
               class IframeComp {
               }

               expectIframeToBeCreated(IframeComp, {[srcAttr]: TEST_IFRAME_URL});
             });

          it(`should error when a security-sensitive attribute is applied ` +
                 `using a property binding (checking \`${securityAttr}\`)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template:
                     `<iframe ${srcAttr}="${TEST_IFRAME_URL}" [${securityAttr}]="''"></iframe>`,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp);
             });

          it(`should error when a security-sensitive attribute is applied ` +
                 `using a property interpolation (checking \`${securityAttr}\`)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template:
                     `<iframe ${srcAttr}="${TEST_IFRAME_URL}" ${securityAttr}="{{''}}"></iframe>`,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp);
             });

          it(`should error when a security-sensitive attribute is applied ` +
                 `using a property binding (checking \`${securityAttr}\`, making ` +
                 `sure it's case-insensitive)`,
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

               expectIframeCreationToFail(IframeComp);
             });

          it(`should error when a security-sensitive attribute is applied ` +
                 `using a property binding (checking \`${securityAttr}\`)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                    <iframe
                      ${srcAttr}="${TEST_IFRAME_URL}"
                      [attr.${securityAttr}]="''"
                    ></iframe>
                  `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp);
             });

          it(`should error when a security-sensitive attribute is applied ` +
                 `using a property binding (checking \`${securityAttr}\`, making ` +
                 `sure it's case-insensitive)`,
             () => {
               @Component({
                 standalone: true,
                 selector: 'my-comp',
                 template: `
                    <iframe
                      ${srcAttr}="${TEST_IFRAME_URL}"
                      [attr.${securityAttr.toUpperCase()}]="''"
                    ></iframe>
                  `,
               })
               class IframeComp {
               }

               expectIframeCreationToFail(IframeComp);
             });

          it(`should allow changing \`${srcAttr}\` after initial render`, () => {
            @Component({
              standalone: true,
              selector: 'my-comp',
              template: `
                    <iframe
                      ${securityAttr}="allow-forms"
                      [${srcAttr}]="src">
                    </iframe>
                  `,
            })
            class IframeComp {
              private sanitizer = inject(DomSanitizer);
              src = this.sanitizeFn(TEST_IFRAME_URL);

              get sanitizeFn() {
                return srcAttr === 'src' ? this.sanitizer.bypassSecurityTrustResourceUrl :
                                           this.sanitizer.bypassSecurityTrustHtml;
              }
            }

            const fixture = expectIframeToBeCreated(IframeComp, {[srcAttr]: TEST_IFRAME_URL});
            const component = fixture.componentInstance;

            // Changing `src` or `srcdoc` is allowed.
            const newUrl = 'https://angular.io/about?group=Angular';
            component.src = component.sanitizeFn(newUrl);
            expect(() => fixture.detectChanges()).not.toThrow();
            expect(fixture.nativeElement.querySelector('iframe')[srcAttr]).toEqual(newUrl);
          });
        });
      });

      it('should work when a directive sets a security-sensitive attribute as a static attribute',
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });

      it('should work when a directive sets a security-sensitive host attribute on a non-iframe element',
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


      it('should work when a security-sensitive attribute on an <iframe> ' +
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });

      it('should work when a security-sensitive attribute is set between `src` and `srcdoc`',
         () => {
           @Component({
             standalone: true,
             selector: 'my-comp',
             template: `<iframe src="${TEST_IFRAME_URL}" sandbox srcdoc="Hi!"></iframe>`,
           })
           class IframeComp {
           }

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });

      it('should work when a directive sets an `src` and ' +
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });

      it('should error when a directive sets a security-sensitive attribute ' +
             'as an attribute binding (checking that it\'s case-insensitive)',
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

           expectIframeCreationToFail(IframeComp);
         });

      it('should work when a directive sets an `src` and ' +
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });

      it('should work when a security-sensitive attribute is set as a static attribute', () => {
        @Component({
          standalone: true,
          selector: 'my-comp',
          template: `
            <iframe referrerPolicy="no-referrer" src="${TEST_IFRAME_URL}"></iframe>
          `,
        })
        class IframeComp {
        }

        expectIframeToBeCreated(IframeComp, {
          src: TEST_IFRAME_URL,
          referrerPolicy: 'no-referrer',
        });
      });

      it('should error when a security-sensitive attribute is set ' +
             'as a property binding and an <iframe> is wrapped into another element',
         () => {
           @Component({
             standalone: true,
             selector: 'my-comp',
             template: `
                <section>
                  <iframe
                    src="${TEST_IFRAME_URL}"
                    [referrerPolicy]="'no-referrer'"
                  ></iframe>
                </section>`,
           })
           class IframeComp {
           }

           expectIframeCreationToFail(IframeComp);
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });

      it('should work when a directive that sets a security-sensitive attribute has ' +
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
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

           expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
         });


      it('should error when creating a view that contains an <iframe> ' +
             'with security-sensitive attributes set via property bindings',
         () => {
           @Component({
             standalone: true,
             selector: 'my-comp',
             template: `
                <ng-container #container></ng-container>
                <ng-template #template>
                  <iframe src="${TEST_IFRAME_URL}" [sandbox]="''"></iframe>
                </ng-template>
              `,
           })
           class IframeComp {
             @ViewChild('container', {read: ViewContainerRef}) container!: ViewContainerRef;
             @ViewChild('template') template!: TemplateRef<unknown>;

             createEmbeddedView() {
               this.container.createEmbeddedView(this.template);
             }
           }

           const fixture = TestBed.createComponent(IframeComp);
           fixture.detectChanges();

           expect(() => {
             fixture.componentInstance.createEmbeddedView();
             fixture.detectChanges();
           }).toThrowError(getErrorMessageRegexp());

           ensureNoIframePresent(fixture);
         });

      describe('i18n', () => {
        it('should error when a security-sensitive attribute is set as ' +
               'a property binding on an <iframe> inside i18n block',
           () => {
             @Component({
               standalone: true,
               selector: 'my-comp',
               template: `
                  <section i18n>
                    <iframe src="${TEST_IFRAME_URL}" [sandbox]="''">
                    </iframe>
                  </section>
                `,
             })
             class IframeComp {
             }

             expectIframeCreationToFail(IframeComp);
           });

        it('should error when a security-sensitive attribute is set as ' +
               'a property binding on an <iframe> annotated with i18n attribute',
           () => {
             @Component({
               standalone: true,
               selector: 'my-comp',
               template: `
                  <iframe i18n src="${TEST_IFRAME_URL}" [sandbox]="''">
                  </iframe>
                `,
             })
             class IframeComp {
             }

             expectIframeCreationToFail(IframeComp);
           });

        it('should work when a security-sensitive attributes are marked for translation', () => {
          @Component({
            standalone: true,
            selector: 'my-comp',
            template: `
              <iframe src="${TEST_IFRAME_URL}" i18n-sandbox sandbox="">
              </iframe>
            `,
          })
          class IframeComp {
          }

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        });
      });
    });
  });
});
