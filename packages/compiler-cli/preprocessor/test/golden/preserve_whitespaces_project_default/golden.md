# /out/test.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ProjectDefaultComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ProjectDefaultComponent, never> =
    function ProjectDefaultComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ProjectDefaultComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ProjectDefaultComponent,
    'project-default',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ProjectDefaultComponent,
    selectors: [['project-default']],
    decls: 5,
    vars: 0,
    template: function ProjectDefaultComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, '   ');
        i0.ɵɵelementStart(2, 'span');
        i0.ɵɵtext(3, ' a ');
        i0.ɵɵelementEnd();
        i0.ɵɵtext(4, '   ');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ProjectDefaultComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'project-default',
                template: '<div>   <span> a </span>   </div>',
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
    i0.ɵsetClassDebugInfo(ProjectDefaultComponent, {
      className: 'ProjectDefaultComponent',
      filePath: 'test.component.ts',
      lineNumber: 7,
    });
})();

export class ComponentOverrideComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ComponentOverrideComponent, never> =
    function ComponentOverrideComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ComponentOverrideComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ComponentOverrideComponent,
    'component-override',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComponentOverrideComponent,
    selectors: [['component-override']],
    decls: 3,
    vars: 0,
    template: function ComponentOverrideComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div')(1, 'span');
        i0.ɵɵtext(2, ' b ');
        i0.ɵɵelementEnd()();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ComponentOverrideComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'component-override',
                template: '<div>   <span> b </span>   </div>',
                preserveWhitespaces: false,
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
    i0.ɵsetClassDebugInfo(ComponentOverrideComponent, {
      className: 'ComponentOverrideComponent',
      filePath: 'test.component.ts',
      lineNumber: 14,
    });
})();

```