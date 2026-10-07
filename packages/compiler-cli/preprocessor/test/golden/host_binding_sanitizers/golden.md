# /out/host_binding_sanitizers.ts
```ts
import { Component, Directive, HostBinding } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// A directive's host bindings do not necessarily run against an element named by its own
// selector: host directives and dynamically created root components (whose host TNode is
// named `#host`) both apply a directive to an element the selector never mentions. The
// security context therefore has to account for every element the property could land on.

// `href` is a URL on `<a>`/`<area>` but a RESOURCE_URL on `<base>`/`<link>`, so the sanitizer
// has to be picked at runtime from the concrete host: `ɵɵsanitizeUrlOrResourceUrl`.
export class AmbiguousUrlDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AmbiguousUrlDir, never> = function AmbiguousUrlDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AmbiguousUrlDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AmbiguousUrlDir,
    'a[ambiguousUrlDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AmbiguousUrlDir,
    selectors: [['a', 'ambiguousUrlDir', '']],
    hostVars: 1,
    hostBindings: function AmbiguousUrlDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('href', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AmbiguousUrlDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'a[ambiguousUrlDir]',
                host: {
                  '[href]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// Same for `src`: a URL on `<img>`/`<video>`, a RESOURCE_URL on `<embed>`/`<frame>`/`<iframe>`.
export class AmbiguousResourceUrlDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AmbiguousResourceUrlDir, never> =
    function AmbiguousResourceUrlDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AmbiguousResourceUrlDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AmbiguousResourceUrlDir,
    'iframe[ambiguousResourceUrlDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AmbiguousResourceUrlDir,
    selectors: [['iframe', 'ambiguousResourceUrlDir', '']],
    hostVars: 1,
    hostBindings: function AmbiguousResourceUrlDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('src', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AmbiguousResourceUrlDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'iframe[ambiguousResourceUrlDir]',
                host: {
                  '[src]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// `data` is a RESOURCE_URL only on `<object>` and inert everywhere else. The declaring
// selector names no element that carries it, but the concrete host still might, so this also
// has to defer to `ɵɵsanitizeUrlOrResourceUrl`.
export class AmbiguousAttributeDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AmbiguousAttributeDir, never> =
    function AmbiguousAttributeDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AmbiguousAttributeDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AmbiguousAttributeDir,
    'safe-data-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AmbiguousAttributeDir,
    selectors: [['safe-data-carrier']],
    hostVars: 1,
    hostBindings: function AmbiguousAttributeDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('data', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AmbiguousAttributeDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-data-carrier',
                host: {
                  '[attr.data]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// Properties whose only non-inert context is a single non-URL one keep their dedicated
// sanitizer: `srcdoc` is HTML on `<iframe>`, `innerHtml` is HTML everywhere, `style` is STYLE
// everywhere.
export class UnambiguousDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UnambiguousDir, never> = function UnambiguousDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UnambiguousDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    UnambiguousDir,
    'safe-srcdoc-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: UnambiguousDir,
    selectors: [['safe-srcdoc-carrier']],
    hostVars: 3,
    hostBindings: function UnambiguousDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵattribute('srcdoc', ctx.evil, i0.ɵɵsanitizeHtml)(
          'style',
          ctx.evil,
          i0.ɵɵsanitizeStyle,
        );
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UnambiguousDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-srcdoc-carrier',
                host: {
                  '[attr.srcdoc]': 'evil',
                  '[innerHtml]': 'evil',
                  '[attr.style]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// `xlink:href` is a URL on `<a>` and on every MathML element, and inert elsewhere. A
// URL-or-inert union is still ambiguous, so it also has to defer to the runtime sanitizer.
export class AmbiguousXlinkDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AmbiguousXlinkDir, never> =
    function AmbiguousXlinkDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AmbiguousXlinkDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AmbiguousXlinkDir,
    'safe-xlink-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AmbiguousXlinkDir,
    selectors: [['safe-xlink-carrier']],
    hostVars: 1,
    hostBindings: function AmbiguousXlinkDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('xlink:href', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AmbiguousXlinkDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-xlink-carrier',
                host: {
                  '[attr.xlink:href]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// Negative control: `formAction` is a URL on *every* element, so its union is unambiguous and
// it must keep the plain `ɵɵsanitizeUrl`. This pins that ambiguous-context handling does not
// blanket-upgrade every URL binding to `ɵɵsanitizeUrlOrResourceUrl`.
export class UnambiguousUrlDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UnambiguousUrlDir, never> =
    function UnambiguousUrlDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || UnambiguousUrlDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    UnambiguousUrlDir,
    '[unambiguousUrlDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: UnambiguousUrlDir,
    selectors: [['', 'unambiguousUrlDir', '']],
    hostVars: 1,
    hostBindings: function UnambiguousUrlDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('formAction', ctx.evil, i0.ɵɵsanitizeUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UnambiguousUrlDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[unambiguousUrlDir]',
                host: {
                  '[formAction]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// The `@HostBinding` decorator spelling and the `attr.` spelling of an ambiguous property must
// resolve identically to the `host: {...}` property spelling above.
export class DecoratedHostBindingDir {
  evil = 'evil';

  get srcBinding() {
    return this.evil;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DecoratedHostBindingDir, never> =
    function DecoratedHostBindingDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DecoratedHostBindingDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DecoratedHostBindingDir,
    '[decoratedDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DecoratedHostBindingDir,
    selectors: [['', 'decoratedDir', '']],
    hostVars: 2,
    hostBindings: function DecoratedHostBindingDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('src', ctx.srcBinding, i0.ɵɵsanitizeUrlOrResourceUrl);
        i0.ɵɵattribute('href', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DecoratedHostBindingDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[decoratedDir]',
                host: {
                  '[attr.href]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        { srcBinding: [{ type: HostBinding, args: ['src'] }] },
      );
  }
}

// `attributeName` drives SVG animation elements. Because the concrete host is unknown, every
// directive binding to it now emits `ɵɵvalidateAttribute` — which rejects the binding at
// runtime — regardless of the element its selector names.
export class ValidatedAttributeDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ValidatedAttributeDir, never> =
    function ValidatedAttributeDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ValidatedAttributeDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ValidatedAttributeDir,
    'safe-animation-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ValidatedAttributeDir,
    selectors: [['safe-animation-carrier']],
    hostVars: 1,
    hostBindings: function ValidatedAttributeDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('attributeName', ctx.evil, i0.ɵɵvalidateAttribute);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ValidatedAttributeDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-animation-carrier',
                host: {
                  '[attr.attributeName]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// A property that is inert on every element gets no sanitizer at all.
export class PlainDir {
  safe = 'safe';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PlainDir, never> = function PlainDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PlainDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    PlainDir,
    '[plainDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: PlainDir,
    selectors: [['', 'plainDir', '']],
    hostVars: 1,
    hostBindings: function PlainDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('title', ctx.safe);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PlainDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[plainDir]',
                host: {
                  '[title]': 'safe',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// Guard: none of the above may leak into *template* bindings. There the element is known, so
// `<a [href]>` keeps the plain `ɵɵsanitizeUrl` and `[attr.sandbox]` on a `<div>` needs no
// sanitizer at all. If host-binding context resolution ever started applying to templates,
// these two lines would change.
export class TemplateBindingsCmp {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TemplateBindingsCmp, never> =
    function TemplateBindingsCmp_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TemplateBindingsCmp)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TemplateBindingsCmp,
    'template-bindings',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TemplateBindingsCmp,
    selectors: [['template-bindings']],
    decls: 2,
    vars: 2,
    consts: [[3, 'href']],
    template: function TemplateBindingsCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'a', 0)(1, 'div');
      }
      if (rf & 2) {
        i0.ɵɵproperty('href', ctx.evil, i0.ɵɵsanitizeUrl);
        i0.ɵɵadvance();
        i0.ɵɵattribute('sandbox', ctx.evil);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TemplateBindingsCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'template-bindings',
                standalone: true,
                template: `<a [href]="evil"></a><div [attr.sandbox]="evil"></div>`,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TemplateBindingsCmp, {
      className: 'TemplateBindingsCmp',
      filePath: 'host_binding_sanitizers.ts',
      lineNumber: 134,
    });
})();

```