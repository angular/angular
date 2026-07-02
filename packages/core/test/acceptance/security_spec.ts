/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {
  ApplicationRef,
  Component,
  ComponentRef,
  createComponent,
  Directive,
  EnvironmentInjector,
  inject,
  inputBinding,
  Input,
  provideZoneChangeDetection,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '../../src/core';
import {RuntimeErrorCode} from '../../src/errors';
import {global} from '../../src/util/global';
import {ComponentFixture, TestBed} from '../../testing';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const MATH_ML_NAMESPACE_URI = 'http://www.w3.org/1998/Math/MathML';

describe('comment node text escaping', () => {
  // see: https://html.spec.whatwg.org/multipage/syntax.html#comments
  [
    '>', // self closing
    '-->', // standard closing
    '--!>', // alternate closing
    '<!-- -->', // embedded comment.
  ].forEach((xssValue) => {
    it(
      'should not be possible to do XSS through comment reflect data when writing: ' + xssValue,
      () => {
        @Component({
          template: `<div>
            <span *ngIf="xssValue"></span>
            <div></div>
          </div>`,
          standalone: false,

          changeDetection: ChangeDetectionStrategy.Eager,
        })
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
      },
    );
  });
});

describe('iframe processing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  function getErrorMessageRegexp() {
    const errorMessagePart = 'NG0' + Math.abs(RuntimeErrorCode.UNSAFE_ATTRIBUTE_BINDING).toString();
    return new RegExp(errorMessagePart);
  }

  function ensureNoIframePresent(fixture?: ComponentFixture<unknown>) {
    // Note: a `fixture` may not exist in case an error was thrown at creation time.
    const iframe = fixture?.nativeElement.querySelector('iframe');
    expect(!!iframe).toBeFalse();
  }

  function expectIframeCreationToFail<T>(component: Type<T>): ComponentFixture<T> {
    let fixture: ComponentFixture<T> | undefined;
    expect(() => {
      fixture = TestBed.createComponent(component);
      fixture.detectChanges();
    }).toThrowError(getErrorMessageRegexp());

    ensureNoIframePresent(fixture);
    return fixture!;
  }

  function expectIframeToBeCreated<T>(
    component: Type<T>,
    attrsToCheck: {[key: string]: string},
  ): ComponentFixture<T> {
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
  const SECURITY_SENSITIVE_ATTRS = [
    'sandbox',
    'allow',
    'allowFullscreen',
    'referrerPolicy',
    'csp',
    'fetchPriority',
    'credentialless',
  ];

  const TEST_IFRAME_URL = 'https://angular.io/assets/images/logos/angular/angular.png';

  let oldNgDevMode!: typeof ngDevMode;

  beforeAll(() => {
    oldNgDevMode = ngDevMode;
  });

  afterAll(() => {
    global['ngDevMode'] = oldNgDevMode;
  });

  [true, false].forEach((devModeFlag) => {
    beforeAll(() => {
      global['ngDevMode'] = devModeFlag;

      // TestBed and JIT compilation have some dependencies on the ngDevMode state, so we need to
      // reset TestBed to ensure we get a 'clean' JIT compilation under the new rules.
      TestBed.resetTestingModule();
    });

    describe(`with ngDevMode = ${devModeFlag}`, () => {
      SECURITY_SENSITIVE_ATTRS.forEach((securityAttr: string) => {
        ['src', 'srcdoc'].forEach((srcAttr: string) => {
          it(
            `should work when a security-sensitive attribute is set ` +
              `as a static attribute (checking \`${securityAttr}\` with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: ` <iframe ${srcAttr}="${TEST_IFRAME_URL}" ${securityAttr}=""> </iframe>`,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeToBeCreated(IframeComp, {[srcAttr]: TEST_IFRAME_URL});
            },
          );

          it(
            `should work when a security-sensitive attribute is set ` +
              `as a static attribute (checking \`${securityAttr}\` and ` +
              `making sure it's case-insensitive, with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: ` <iframe
                  ${srcAttr}="${TEST_IFRAME_URL}"
                  ${securityAttr.toUpperCase()}=""
                >
                </iframe>`,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeToBeCreated(IframeComp, {[srcAttr]: TEST_IFRAME_URL});
            },
          );

          it(
            `should error when a security-sensitive attribute is applied ` +
              `using a property binding (checking \`${securityAttr}\`, with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: `<iframe
                  ${srcAttr}="${TEST_IFRAME_URL}"
                  [${securityAttr}]="''"
                ></iframe>`,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeCreationToFail(IframeComp);
            },
          );

          it(
            `should error when a security-sensitive attribute is applied ` +
              `using a property interpolation (checking \`${securityAttr}\`, with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: `<iframe
                  ${srcAttr}="${TEST_IFRAME_URL}"
                  ${securityAttr}="{{ '' }}"
                ></iframe>`,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeCreationToFail(IframeComp);
            },
          );

          it(
            `should error when a security-sensitive attribute is applied ` +
              `using a property binding (checking \`${securityAttr}\`, making ` +
              `sure it's case-insensitive, with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: `
                  <iframe
                    ${srcAttr}="${TEST_IFRAME_URL}"
                    [${securityAttr.toUpperCase()}]="''"
                  ></iframe>
                `,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeCreationToFail(IframeComp);
            },
          );

          it(
            `should error when a security-sensitive attribute is applied ` +
              `using a property binding (checking \`${securityAttr}\` (attr.), with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: `
                  <iframe ${srcAttr}="${TEST_IFRAME_URL}" [attr.${securityAttr}]="''"></iframe>
                `,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeCreationToFail(IframeComp);
            },
          );

          it(
            `should error when a security-sensitive attribute is applied ` +
              `using a property binding (checking \`${securityAttr}\` (attr.) with null, with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: `
                  <iframe ${srcAttr}="${TEST_IFRAME_URL}" [attr.${securityAttr}]="null"></iframe>
                `,
              })
              class IframeComp {}

              expectIframeCreationToFail(IframeComp);
            },
          );

          it(
            `should error when a security-sensitive attribute is applied ` +
              `using a property binding (checking \`${securityAttr}\` with [attr.], making ` +
              `sure it's case-insensitive, with \`${srcAttr}\`)`,
            () => {
              @Component({
                selector: 'my-comp',
                template: `
                  <iframe
                    ${srcAttr}="${TEST_IFRAME_URL}"
                    [attr.${securityAttr.toUpperCase()}]="''"
                  ></iframe>
                `,

                changeDetection: ChangeDetectionStrategy.Eager,
              })
              class IframeComp {}

              expectIframeCreationToFail(IframeComp);
            },
          );

          it(`should allow changing \`${srcAttr}\` after initial render with \`${securityAttr}\``, () => {
            @Component({
              selector: 'my-comp',
              template: ` <iframe ${securityAttr}="allow-forms" [${srcAttr}]="src"> </iframe> `,

              changeDetection: ChangeDetectionStrategy.Eager,
            })
            class IframeComp {
              private sanitizer = inject(DomSanitizer);
              src = this.sanitizeFn(TEST_IFRAME_URL);

              get sanitizeFn() {
                return srcAttr === 'src'
                  ? this.sanitizer.bypassSecurityTrustResourceUrl
                  : this.sanitizer.bypassSecurityTrustHtml;
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

      it('should error when a translated security-sensitive attribute contains bindings', () => {
        @Component({
          selector: 'my-comp',
          template: `
            <iframe
              src="${TEST_IFRAME_URL}"
              i18n-sandbox
              sandbox="allow-forms {{ extraPrivileges }}"
            >
            </iframe>
          `,

          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class IframeComp {
          extraPrivileges = 'allow-scripts allow-same-origin';
        }

        expectIframeCreationToFail(IframeComp);
      });

      it('should work when a directive sets a security-sensitive attribute as a static attribute', () => {
        @Directive({
          selector: '[dir]',
          host: {
            'src': TEST_IFRAME_URL,
            'sandbox': '',
          },
        })
        class IframeDir {}
        @Component({
          imports: [IframeDir],
          selector: 'my-comp',
          template: '<iframe dir></iframe>',

          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class IframeComp {}

        expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
      });

      it('should work when a directive sets a security-sensitive host attribute on a non-iframe element', () => {
        @Directive({
          selector: '[dir]',
          host: {
            'src': TEST_IFRAME_URL,
            'sandbox': '',
          },
        })
        class Dir {}

        @Component({
          imports: [Dir],
          selector: 'my-comp',
          template: '<img dir>',

          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class NonIframeComp {}

        const fixture = TestBed.createComponent(NonIframeComp);
        fixture.detectChanges();

        expect(fixture.nativeElement.firstChild.src).toEqual(TEST_IFRAME_URL);
      });

      it(
        'should work when a security-sensitive attribute on an <iframe> ' +
          'which also has a structural directive (*ngIf)',
        () => {
          @Component({
            imports: [NgIf],
            selector: 'my-comp',
            template: `<iframe *ngIf="visible" src="${TEST_IFRAME_URL}" sandbox=""></iframe>`,

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {
            visible = true;
          }

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it('should work when a security-sensitive attribute is set between `src` and `srcdoc`', () => {
        @Component({
          selector: 'my-comp',
          template: `<iframe src="${TEST_IFRAME_URL}" sandbox srcdoc="Hi!"></iframe>`,

          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class IframeComp {}

        expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
      });

      it('should work when a directive sets a security-sensitive attribute before setting `src`', () => {
        @Directive({
          selector: '[dir]',
          host: {
            'sandbox': '',
            'src': TEST_IFRAME_URL,
          },
        })
        class IframeDir {}

        @Component({
          imports: [IframeDir],
          selector: 'my-comp',
          template: '<iframe dir></iframe>',

          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class IframeComp {}

        expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
      });

      it(
        'should work when a directive sets an `src` and ' +
          'there was a security-sensitive attribute set in a template' +
          '(directive attribute after `sandbox`)',
        () => {
          @Directive({
            selector: '[dir]',
            host: {
              'src': TEST_IFRAME_URL,
            },
          })
          class IframeDir {}

          @Component({
            imports: [IframeDir],
            selector: 'my-comp',
            template: '<iframe sandbox dir></iframe>',

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it(
        'should error when a directive sets a security-sensitive attribute ' +
          "as an attribute binding (checking that it's case-insensitive)",
        () => {
          @Directive({
            selector: '[dir]',
            host: {
              '[attr.SANDBOX]': "''",
            },
          })
          class IframeDir {}

          @Component({
            imports: [IframeDir],
            selector: 'my-comp',
            template: `<IFRAME dir src="${TEST_IFRAME_URL}"></IFRAME>`,

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeCreationToFail(IframeComp);
        },
      );

      it(
        'should work when a directive sets an `src` and ' +
          'there was a security-sensitive attribute set in a template' +
          '(directive attribute before `sandbox`)',
        () => {
          @Directive({
            selector: '[dir]',
            host: {
              'src': TEST_IFRAME_URL,
            },
          })
          class IframeDir {}

          @Component({
            imports: [IframeDir],
            selector: 'my-comp',
            template: '<iframe dir sandbox></iframe>',

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it(
        'should work when a directive sets a security-sensitive attribute and ' +
          'there was an `src` attribute set in a template' +
          '(directive attribute after `src`)',
        () => {
          @Directive({
            selector: '[dir]',
            host: {
              'sandbox': '',
            },
          })
          class IframeDir {}

          @Component({
            imports: [IframeDir],
            selector: 'my-comp',
            template: `<iframe src="${TEST_IFRAME_URL}" dir></iframe>`,

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it('should work when a security-sensitive attribute is set as a static attribute', () => {
        @Component({
          selector: 'my-comp',
          template: ` <iframe referrerPolicy="no-referrer" src="${TEST_IFRAME_URL}"></iframe> `,

          changeDetection: ChangeDetectionStrategy.Eager,
        })
        class IframeComp {}

        expectIframeToBeCreated(IframeComp, {
          src: TEST_IFRAME_URL,
          referrerPolicy: 'no-referrer',
        });
      });

      it(
        'should error when a security-sensitive attribute is set ' +
          'as a property binding and an <iframe> is wrapped into another element',
        () => {
          @Component({
            selector: 'my-comp',
            template: ` <section>
              <iframe src="${TEST_IFRAME_URL}" [referrerPolicy]="'no-referrer'"></iframe>
            </section>`,

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeCreationToFail(IframeComp);
        },
      );

      it(
        'should work when a directive sets a security-sensitive attribute and ' +
          'there was an `src` attribute set in a template' +
          '(directive attribute before `src`)',
        () => {
          @Directive({
            selector: '[dir]',
            host: {
              'sandbox': '',
            },
          })
          class IframeDir {}

          @Component({
            imports: [IframeDir],
            selector: 'my-comp',
            template: `<iframe dir src="${TEST_IFRAME_URL}"></iframe>`,

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it(
        'should work when a directive that sets a security-sensitive attribute goes ' +
          'before the directive that sets an `src` attribute value',
        () => {
          @Directive({
            selector: '[set-src]',
            host: {
              'src': TEST_IFRAME_URL,
            },
          })
          class DirThatSetsSrc {}

          @Directive({
            selector: '[set-sandbox]',
            host: {
              'sandbox': '',
            },
          })
          class DirThatSetsSandbox {}

          @Component({
            imports: [DirThatSetsSandbox, DirThatSetsSrc],
            selector: 'my-comp',
            // Important note: even though the `set-sandbox` goes after the `set-src`,
            // the directive matching order (thus the order of host attributes) is
            // based on the imports order, so the `sandbox` gets set first and the `src` second.
            template: '<iframe set-src set-sandbox></iframe>',

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it(
        'should work when a directive that sets a security-sensitive attribute has ' +
          'a host directive that sets an `src` attribute value',
        () => {
          @Directive({
            selector: '[set-src-dir]',
            host: {
              'src': TEST_IFRAME_URL,
            },
          })
          class DirThatSetsSrc {}

          @Directive({
            selector: '[dir]',
            hostDirectives: [DirThatSetsSrc],
            host: {
              'sandbox': '',
            },
          })
          class DirThatSetsSandbox {}

          @Component({
            imports: [DirThatSetsSandbox],
            selector: 'my-comp',
            template: '<iframe dir></iframe>',

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it(
        'should work when a directive that sets an `src` has ' +
          'a host directive that sets a security-sensitive attribute value',
        () => {
          @Directive({
            selector: '[set-sandbox-dir]',
            host: {
              'sandbox': '',
            },
          })
          class DirThatSetsSandbox {}

          @Directive({
            selector: '[dir]',
            hostDirectives: [DirThatSetsSandbox],
            host: {
              'src': TEST_IFRAME_URL,
            },
          })
          class DirThatSetsSrc {}

          @Component({
            imports: [DirThatSetsSrc],
            selector: 'my-comp',
            template: '<iframe dir></iframe>',

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        },
      );

      it(
        'should error when creating a view that contains an <iframe> ' +
          'with security-sensitive attributes set via property bindings',
        () => {
          @Component({
            selector: 'my-comp',
            template: `
              <ng-container #container></ng-container>
              <ng-template #template>
                <iframe src="${TEST_IFRAME_URL}" [sandbox]="''"></iframe>
              </ng-template>
            `,

            changeDetection: ChangeDetectionStrategy.Eager,
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
        },
      );

      describe('i18n', () => {
        it(
          'should error when a security-sensitive attribute is set as ' +
            'a property binding on an <iframe> inside i18n block',
          () => {
            @Component({
              selector: 'my-comp',
              template: `
                <section i18n>
                  <iframe src="${TEST_IFRAME_URL}" [sandbox]="''"> </iframe>
                </section>
              `,

              changeDetection: ChangeDetectionStrategy.Eager,
            })
            class IframeComp {}

            expectIframeCreationToFail(IframeComp);
          },
        );

        it(
          'should error when a security-sensitive attribute is set as ' +
            'a property binding on an <iframe> annotated with i18n attribute',
          () => {
            @Component({
              selector: 'my-comp',
              template: ` <iframe i18n src="${TEST_IFRAME_URL}" [sandbox]="''"> </iframe> `,

              changeDetection: ChangeDetectionStrategy.Eager,
            })
            class IframeComp {}

            expectIframeCreationToFail(IframeComp);
          },
        );

        it('should work when a security-sensitive attributes are marked for translation', () => {
          @Component({
            selector: 'my-comp',
            template: ` <iframe src="${TEST_IFRAME_URL}" i18n-sandbox sandbox=""> </iframe> `,

            changeDetection: ChangeDetectionStrategy.Eager,
          })
          class IframeComp {}

          expectIframeToBeCreated(IframeComp, {src: TEST_IFRAME_URL});
        });
      });
    });
  });
});

describe('SVG animation processing', () => {
  it('should error when `attributeName` is bound', () => {
    @Component({
      template: '<svg><animate [attr.attributeName]="attr"></animate></svg>',

      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestCmp {
      attr = 'href';
    }

    expect(() => {
      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
    }).toThrowError(
      /NG0910: Angular has detected that the `attributeName` was applied as a binding to the <animate>/,
    );
  });

  it(`should error when a directive sets a 'attributeName' as an attribute binding`, () => {
    @Directive({
      selector: '[dir]',
      host: {
        '[attr.attributeName]': "'href'",
      },
    })
    class animateAttrDir {}

    @Component({
      imports: [animateAttrDir],
      selector: 'my-comp',
      template: '<svg><animate dir></animate></svg>',

      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestCmp {}

    expect(() => {
      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
    }).toThrowError(
      /NG0910: Angular has detected that the `attributeName` was applied as a binding to the <animate>/,
    );
  });
});

describe('innerHTML processing', () => {
  it('should drop risky attributes from elements created with innerHTML', () => {
    @Component({
      template: '<div [innerHTML]="html"></div>',

      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class App {
      html = '<div action="abc"></div>';
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).not.toContain('action');
  });
});

describe('host binding sanitization', () => {
  const HOST_BINDING_URL = 'http://server/asset';
  const HOST_BINDING_UNSAFE_URL = 'javascript:custom-data';
  const UNSAFE_HTML = `<script>evil</script>` + '<p>safe</p>';
  const SANITIZED_HTML = '<p>safe</p>';
  const resourceUrlError = /NG0904: unsafe value used in a resource URL context.*/;

  async function expectHostBinding(options: {
    tagName: string;
    attrName: string;
    value: string;
    expected?: string;
    expectedError?: RegExp;
    namespace?: string;
    componentSelector?: string;
  }): Promise<void> {
    // Avoid duplicate selector generation.
    const randomIdentifier = Math.floor(Math.random() * 100);

    const {
      tagName,
      attrName,
      value,
      expected,
      expectedError,
      namespace,
      componentSelector = `dynamic-host-${randomIdentifier}`,
    } = options;

    @Directive({
      selector: `[safe-data-carrier-${randomIdentifier}]`,
      host: {[`[attr.${attrName}]`]: 'val'},
    })
    class CarrierDirective {
      val = value;
    }

    @Component({
      selector: componentSelector,
      template: '',
    })
    class DynamicComponent {}

    const hostElement = namespace
      ? document.createElementNS(namespace, tagName)
      : document.createElement(tagName);

    let componentRef: ComponentRef<DynamicComponent> | undefined;

    @Component({
      template: '',
    })
    class AppHost {
      private appRef = inject(ApplicationRef);
      private environmentInjector = inject(EnvironmentInjector);

      constructor() {
        componentRef = createComponent(DynamicComponent, {
          hostElement,
          environmentInjector: this.environmentInjector,
          directives: [CarrierDirective],
        });
        this.appRef.attachView(componentRef.hostView);
      }
    }

    const fixture = TestBed.createComponent(AppHost);

    try {
      if (expectedError) {
        await expectAsync(fixture.whenStable()).toBeRejectedWithError(expectedError);
      } else {
        await fixture.whenStable();
        expect(hostElement.getAttribute(attrName)).toBe(expected ?? null);
      }
    } finally {
      componentRef?.destroy();
    }
  }

  it('should not sanitize resource URL attribute names on non-resource concrete hosts', async () => {
    await expectHostBinding({
      tagName: 'div',
      attrName: 'data',
      value: HOST_BINDING_URL,
      expected: HOST_BINDING_URL,
    });
    await expectHostBinding({
      tagName: 'div',
      attrName: 'data',
      value: HOST_BINDING_UNSAFE_URL,
      expected: HOST_BINDING_UNSAFE_URL,
    });
  });

  it('should sanitize href host bindings on SVG links', async () => {
    await expectHostBinding({
      tagName: 'a',
      attrName: 'href',
      value: HOST_BINDING_UNSAFE_URL,
      expected: `unsafe:${HOST_BINDING_UNSAFE_URL}`,
      namespace: SVG_NAMESPACE_URI,
    });
  });

  it('should not sanitize href host bindings on non-link SVG elements', async () => {
    await expectHostBinding({
      tagName: 'rect',
      attrName: 'href',
      value: HOST_BINDING_UNSAFE_URL,
      expected: HOST_BINDING_UNSAFE_URL,
      namespace: SVG_NAMESPACE_URI,
    });
  });

  it('should sanitize xlink:href host bindings on SVG links', async () => {
    await expectHostBinding({
      tagName: 'a',
      attrName: 'xlink:href',
      value: HOST_BINDING_UNSAFE_URL,
      expected: `unsafe:${HOST_BINDING_UNSAFE_URL}`,
      namespace: SVG_NAMESPACE_URI,
    });
  });

  it('should sanitize href host bindings on MathML elements', async () => {
    await expectHostBinding({
      tagName: 'mi',
      attrName: 'href',
      value: HOST_BINDING_UNSAFE_URL,
      expected: `unsafe:${HOST_BINDING_UNSAFE_URL}`,
      namespace: MATH_ML_NAMESPACE_URI,
    });
  });

  it('should sanitize href host bindings on dynamic SVG hosts as URLs', async () => {
    await expectHostBinding({
      tagName: 'a',
      attrName: 'href',
      value: HOST_BINDING_UNSAFE_URL,
      expected: `unsafe:${HOST_BINDING_UNSAFE_URL}`,
      namespace: SVG_NAMESPACE_URI,
    });
  });

  it('should sanitize href host bindings on dynamic MathML hosts as URLs', async () => {
    await expectHostBinding({
      tagName: 'base',
      attrName: 'href',
      value: HOST_BINDING_UNSAFE_URL,
      expected: `unsafe:${HOST_BINDING_UNSAFE_URL}`,
      namespace: MATH_ML_NAMESPACE_URI,
    });
  });

  it('should sanitize a dynamic directive host binding against the concrete host element', async () => {
    @Component({
      selector: 'iframe',
      template: '',
    })
    class DynamicIframeHostComponent {}

    @Directive({
      selector: 'safe-srcdoc-carrier',
      host: {'[attr.srcdoc]': 'srcdoc'},
    })
    class SafeSrcdocCarrierDirective {
      @Input() srcdoc = '';
    }

    @Component({
      template: '',
      imports: [DynamicIframeHostComponent],
    })
    class App {
      componentRef: ComponentRef<DynamicIframeHostComponent>;

      private viewContainerRef = inject(ViewContainerRef);
      private environmentInjector = inject(EnvironmentInjector);

      constructor() {
        this.componentRef = this.viewContainerRef.createComponent(DynamicIframeHostComponent, {
          environmentInjector: this.environmentInjector,
          directives: [
            {
              type: SafeSrcdocCarrierDirective,
              bindings: [inputBinding('srcdoc', () => UNSAFE_HTML)],
            },
          ],
        });
      }
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const iframe = fixture.componentInstance.componentRef.location
      .nativeElement as HTMLIFrameElement;
    expect(iframe.getAttribute('srcdoc')).toBe(SANITIZED_HTML);
    expect(iframe.getAttribute('srcdoc')).not.toContain('<script>');
  });

  it('should not sanitize iframe-only host bindings on non-iframe concrete hosts', async () => {
    await expectHostBinding({
      tagName: 'div',
      attrName: 'srcdoc',
      value: UNSAFE_HTML,
      expected: UNSAFE_HTML,
    });
  });

  it('should not sanitize form-only URL host bindings on non-form concrete hosts', async () => {
    await expectHostBinding({
      tagName: 'div',
      attrName: 'action',
      value: HOST_BINDING_URL,
      expected: HOST_BINDING_URL,
    });
    await expectHostBinding({
      tagName: 'div',
      attrName: 'action',
      value: HOST_BINDING_UNSAFE_URL,
      expected: HOST_BINDING_UNSAFE_URL,
    });
  });

  it('should sanitize form-only URL host bindings on form concrete hosts', async () => {
    await expectHostBinding({
      tagName: 'form',
      attrName: 'action',
      value: HOST_BINDING_URL,
      expected: HOST_BINDING_URL,
    });
    await expectHostBinding({
      tagName: 'form',
      attrName: 'action',
      value: HOST_BINDING_UNSAFE_URL,
      expected: `unsafe:${HOST_BINDING_UNSAFE_URL}`,
    });
  });

  it('should sanitize a host directive host binding against the concrete host element', async () => {
    @Directive({
      selector: 'safe-srcdoc-host',
      host: {'[attr.srcdoc]': 'srcdoc'},
    })
    class SafeSrcdocHostDirective {
      srcdoc = UNSAFE_HTML;
    }

    @Directive({
      selector: '[safe-srcdoc-host-carrier]',
      hostDirectives: [SafeSrcdocHostDirective],
    })
    class SafeSrcdocHostCarrierDirective {}

    @Component({
      template: '<iframe safe-srcdoc-host-carrier></iframe>',
      imports: [SafeSrcdocHostCarrierDirective],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.getAttribute('srcdoc')).toBe(SANITIZED_HTML);
    expect(iframe.getAttribute('srcdoc')).not.toContain('<script>');
  });

  it('should sanitize an inherited host binding against the concrete host element', async () => {
    @Directive({
      selector: 'base-srcdoc-carrier',
      host: {'[attr.srcdoc]': 'srcdoc'},
    })
    class BaseSrcdocCarrierDirective {
      srcdoc = UNSAFE_HTML;
    }

    @Directive({
      selector: '[derived-srcdoc-carrier]',
    })
    class DerivedSrcdocCarrierDirective extends BaseSrcdocCarrierDirective {}

    @Component({
      template: '<iframe derived-srcdoc-carrier></iframe>',
      imports: [DerivedSrcdocCarrierDirective],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.getAttribute('srcdoc')).toBe(SANITIZED_HTML);
    expect(iframe.getAttribute('srcdoc')).not.toContain('<script>');
  });

  it('should reject dynamic directive host bindings against concrete resource URL sinks', async () => {
    @Component({
      selector: 'iframe',
      template: '',
    })
    class DynamicIframeHostComponent {}

    @Directive({
      selector: 'src-carrier',
      host: {'[attr.src]': 'src'},
    })
    class SrcCarrierDirective {
      @Input() src = '';
    }

    @Component({
      template: '',
      imports: [DynamicIframeHostComponent],
    })
    class App {
      private viewContainerRef = inject(ViewContainerRef);
      private environmentInjector = inject(EnvironmentInjector);

      constructor() {
        this.viewContainerRef.createComponent(DynamicIframeHostComponent, {
          environmentInjector: this.environmentInjector,
          directives: [
            {
              type: SrcCarrierDirective,
              bindings: [inputBinding('src', () => HOST_BINDING_URL)],
            },
          ],
        });
      }
    }

    const fixture = TestBed.createComponent(App);
    await expectAsync(fixture.whenStable()).toBeRejectedWithError(resourceUrlError);
  });

  it('should reject security-sensitive attribute host bindings on concrete dynamic iframe hosts', async () => {
    await expectHostBinding({
      tagName: 'iframe',
      attrName: 'sandbox',
      value: '',
      expectedError:
        /NG0910: Angular has detected that the `sandbox` was applied as a binding to the <iframe>/,
    });
  });

  it('should reject security-sensitive attribute host bindings on concrete dynamic SVG animation hosts', async () => {
    await expectHostBinding({
      tagName: 'animate',
      attrName: 'attributeName',
      value: 'href',
      expectedError:
        /NG0910: Angular has detected that the `attributeName` was applied as a binding to the <animate>/,
      namespace: SVG_NAMESPACE_URI,
    });
  });

  it('should sanitize pure :not selector host bindings against a concrete hostElement', async () => {
    await expectHostBinding({
      tagName: 'iframe',
      attrName: 'srcdoc',
      value: UNSAFE_HTML,
      expected: SANITIZED_HTML,
      componentSelector: ':not(iframe)',
    });
  });

  it('should reject object data host bindings against concrete resource URL sinks', async () => {
    await expectHostBinding({
      tagName: 'object',
      attrName: 'data',
      value: HOST_BINDING_URL,
      expectedError: resourceUrlError,
    });
    await expectHostBinding({
      tagName: 'object',
      attrName: 'data',
      value: HOST_BINDING_UNSAFE_URL,
      expectedError: resourceUrlError,
    });
  });
});

describe('Component host element validation', () => {
  it('should throw an error when dynamically creating a component with a script selector', () => {
    @Component({
      selector: 'script',
      template: '',
    })
    class ScriptHost {}

    const environmentInjector = TestBed.inject(EnvironmentInjector);
    expect(() => {
      createComponent(ScriptHost, {environmentInjector});
    }).toThrowError(/"<script>" tag is not allowed as a component host element/);
  });

  it('should throw an error when dynamically mounting a component onto a script tag', () => {
    @Component({
      selector: 'my-sink',
      template: '',
    })
    class MySink {}

    const scriptHost = document.createElement('script');
    document.head.appendChild(scriptHost);

    try {
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      expect(() => {
        createComponent(MySink, {
          environmentInjector,
          hostElement: scriptHost,
        });
      }).toThrowError(/"<script>" tag is not allowed as a component host element/);
    } finally {
      scriptHost.remove();
    }
  });

  it('should throw an error when dynamically mounting a component onto an SVG script tag', () => {
    @Component({
      selector: 'my-svg-sink',
      template: '',
    })
    class MySvgSink {}

    const svgScriptHost = document.createElementNS(SVG_NAMESPACE_URI, 'script');
    document.head.appendChild(svgScriptHost);

    try {
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      expect(() => {
        createComponent(MySvgSink, {
          environmentInjector,
          hostElement: svgScriptHost,
        });
      }).toThrowError(/"<script>" tag is not allowed as a component host element/);
    } finally {
      svgScriptHost.remove();
    }
  });
});

describe('SVG <script> bindings', () => {
  it(`should remove svg <script> element`, () => {
    @Component({
      template: `<svg><script src="https://bad.com/script.js"></script></svg>`,
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestCmp {}

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('script')).toBeFalsy();
  });
});

describe('SVG <a> link sanitization', () => {
  it('should sanitize dynamic `href` bindings on <svg:a>', () => {
    @Component({
      template: '<svg><a [attr.href]="url"></a></svg>',
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestCmp {
      url = 'javascript:alert(1)';
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toEqual('unsafe:javascript:alert(1)');
  });

  it('should sanitize dynamic `xlink:href` bindings on <svg:a>', () => {
    @Component({
      template: '<svg><a [attr.xlink:href]="url"></a></svg>',
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestCmp {
      url = 'javascript:alert(1)';
    }

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('xlink:href')).toEqual('unsafe:javascript:alert(1)');
  });

  it('should allow static unsafe `href` and `xlink:href` on <svg:a>', () => {
    @Component({
      template: `
        <svg>
          <a href="javascript:alert(1)"></a>
          <a xlink:href="javascript:alert(2)"></a>
        </svg>
      `,
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestCmp {}

    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toEqual('javascript:alert(1)');
    expect(links[1].getAttribute('xlink:href')).toEqual('javascript:alert(2)');
  });
});
