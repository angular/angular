# /out/app/test.component.ts
```ts
import { Component, ViewEncapsulation } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MixedComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MixedComponent, never> = function MixedComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MixedComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MixedComponent,
    'app-mixed',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MixedComponent,
    selectors: [['app-mixed']],
    decls: 2,
    vars: 0,
    template: function MixedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Mixed');
        i0.ɵɵelementEnd();
      }
    },
    styles: ['.url { color: blue; }', '.mixed { color: red; }'],
    encapsulation: 3,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MixedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-mixed',
                template: '<div>Mixed</div>',
                encapsulation: ViewEncapsulation.ShadowDom,
                standalone: true,
                styles: ['.url { color: blue; }', '.mixed { color: red; }'],
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
    i0.ɵsetClassDebugInfo(MixedComponent, {
      className: 'MixedComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 11,
    });
})();

export class UrlsComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UrlsComponent, never> = function UrlsComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UrlsComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    UrlsComponent,
    'app-urls',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: UrlsComponent,
    selectors: [['app-urls']],
    decls: 2,
    vars: 0,
    template: function UrlsComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Urls');
        i0.ɵɵelementEnd();
      }
    },
    styles: ['.more[_ngcontent-%COMP%] { color: green; }'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UrlsComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-urls',
                template: '<div>Urls</div>',
                standalone: true,
                styles: ['.more { color: green; }'],
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
    i0.ɵsetClassDebugInfo(UrlsComponent, {
      className: 'UrlsComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 19,
    });
})();

// This one should trigger an error and NOT have metadata
export class ErrorComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ErrorComponent, never> = function ErrorComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ErrorComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ErrorComponent,
    'app-error',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ErrorComponent,
    selectors: [['app-error']],
    decls: 2,
    vars: 0,
    template: function ErrorComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Error');
        i0.ɵɵelementEnd();
      }
    },
    styles: [
      '.url[_ngcontent-%COMP%] { color: blue; }',
      '.more[_ngcontent-%COMP%] { color: green; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ErrorComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-error',
                template: '<div>Error</div>',
                standalone: true,
                styles: ['.url { color: blue; }', '.more { color: green; }'],
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
    i0.ɵsetClassDebugInfo(ErrorComponent, {
      className: 'ErrorComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 29,
    });
})();

export class StringStylesComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StringStylesComponent, never> =
    function StringStylesComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || StringStylesComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StringStylesComponent,
    'app-string-styles',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StringStylesComponent,
    selectors: [['app-string-styles']],
    decls: 2,
    vars: 0,
    template: function StringStylesComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'String Styles');
        i0.ɵɵelementEnd();
      }
    },
    styles: ['.string[_ngcontent-%COMP%] { color: green; }'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StringStylesComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-string-styles',
                template: '<div>String Styles</div>',
                standalone: true,
                styles: ['.string { color: green; }'],
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
    i0.ɵsetClassDebugInfo(StringStylesComponent, {
      className: 'StringStylesComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 37,
    });
})();

export class TemplateStylesComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TemplateStylesComponent, never> =
    function TemplateStylesComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TemplateStylesComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TemplateStylesComponent,
    'app-template-styles',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TemplateStylesComponent,
    selectors: [['app-template-styles']],
    decls: 2,
    vars: 0,
    template: function TemplateStylesComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Template Styles');
        i0.ɵɵelementEnd();
      }
    },
    styles: ['.template[_ngcontent-%COMP%] {\n      color: purple;\n      content: "\\n";\n    }'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TemplateStylesComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-template-styles',
                template: '<div>Template Styles</div>',
                standalone: true,
                styles: [
                  '\n    .template {\n      color: purple;\n      content: "\\n";\n    }\n  ',
                ],
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
    i0.ɵsetClassDebugInfo(TemplateStylesComponent, {
      className: 'TemplateStylesComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 50,
    });
})();

export class AllStylesComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AllStylesComponent, never> =
    function AllStylesComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AllStylesComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AllStylesComponent,
    'app-all-styles',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AllStylesComponent,
    selectors: [['app-all-styles']],
    decls: 2,
    vars: 0,
    template: function AllStylesComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'All');
        i0.ɵɵelementEnd();
      }
    },
    styles: [
      '.url[_ngcontent-%COMP%] { color: blue; }',
      '.more[_ngcontent-%COMP%] { color: green; }',
      '.decorator[_ngcontent-%COMP%] { color: purple; }',
      '.template[_ngcontent-%COMP%] { color: yellow; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AllStylesComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-all-styles',
                template:
                  '<link rel="stylesheet" href="./more.css"><style> .template { color: yellow; } </style> <div>All</div>',
                standalone: true,
                styles: [
                  '.url { color: blue; }',
                  '.more { color: green; }',
                  '.decorator { color: purple; }',
                  ' .template { color: yellow; } ',
                ],
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
    i0.ɵsetClassDebugInfo(AllStylesComponent, {
      className: 'AllStylesComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 59,
    });
})();

export class IsolatedShadowDomComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IsolatedShadowDomComponent, never> =
    function IsolatedShadowDomComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || IsolatedShadowDomComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    IsolatedShadowDomComponent,
    'app-isolated-shadow-dom',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: IsolatedShadowDomComponent,
    selectors: [['app-isolated-shadow-dom']],
    decls: 2,
    vars: 0,
    consts: [[1, 'isolated']],
    template: function IsolatedShadowDomComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'isolated');
        i0.ɵɵelementEnd();
      }
    },
    styles: ['.url { color: blue; }', '.isolated { color: red; }'],
    encapsulation: 4,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IsolatedShadowDomComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-isolated-shadow-dom',
                template: '<div class="isolated">isolated</div>',
                encapsulation: ViewEncapsulation.ExperimentalIsolatedShadowDom,
                standalone: true,
                styles: ['.url { color: blue; }', '.isolated { color: red; }'],
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
    i0.ɵsetClassDebugInfo(IsolatedShadowDomComponent, {
      className: 'IsolatedShadowDomComponent',
      filePath: 'app/test.component.ts',
      lineNumber: 69,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app/test.component.ts",
      "category": "error",
      "code": 2021,
      "messageText": "@Component cannot define both `styleUrl` and `styleUrls`. Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple",
      "span": {
        "start": 597,
        "end": 619
      }
    }
  ]
}

```