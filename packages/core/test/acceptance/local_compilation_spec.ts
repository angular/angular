/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  forwardRef,
  ɵɵdefineNgModule,
  ɵɵgetComponentDepsFactory,
  ɵɵsetNgModuleScope,
} from '../../src/core';
import {ComponentType} from '../../src/render3';
import {extractDefListOrFactory, extractDirectiveDef} from '../../src/render3/definition';
import {getComponentDef, getNgModuleDef} from '../../src/render3/def_getters';

describe('component dependencies in local compilation', () => {
  it('should compute correct set of dependencies when importing ng-modules directly', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [SubComponent]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {imports: [SubModule], declarations: [MainComponent]});

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules - nested array case', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [[[SubComponent]]]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {imports: [[SubModule]], declarations: [[MainComponent]]});

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules with providers', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [SubComponent]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {
      imports: [{ngModule: SubModule, providers: []}],
      declarations: [MainComponent],
    });

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules with providers - nested array case', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [[[SubComponent]]]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {
      imports: [[{ngModule: SubModule, providers: []}]],
      declarations: [[MainComponent]],
    });

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules using forward ref', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [forwardRef(() => SubComponent)]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {
      imports: [forwardRef(() => SubModule)],
      declarations: [forwardRef(() => MainComponent)],
    });

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules using forward ref - nested array case', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [[[forwardRef(() => SubComponent)]]]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {
      imports: [[forwardRef(() => SubModule)]],
      declarations: [[forwardRef(() => MainComponent)]],
    });

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules with providers using forward ref', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [SubComponent]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {
      imports: [forwardRef(() => ({ngModule: SubModule, providers: []}))],
      declarations: [MainComponent],
    });

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });

  it('should compute correct set of dependencies when importing ng-modules with providers using forward ref (nested in arrays)', () => {
    @Component({
      selector: 'sub',
      standalone: false,
    })
    class SubComponent {}

    class SubModule {
      static ɵmod = ɵɵdefineNgModule({type: SubModule});
    }
    ɵɵsetNgModuleScope(SubModule, {exports: [[[SubComponent]]]});

    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {
      imports: [[forwardRef(() => ({ngModule: SubModule, providers: []}))]],
      declarations: [[MainComponent]],
    });

    const deps = ɵɵgetComponentDepsFactory(MainComponent as ComponentType<any>)();

    expect(deps).toEqual(jasmine.arrayWithExactContents([SubComponent, MainComponent]));
  });
  it('should apply qualified names only to component dependencies', () => {
    @Component({selector: 'card-header', template: ''})
    class HeaderComponent {}

    @Directive({selector: '[cardHeader]'})
    class HeaderDirective {}

    @Component({
      imports: [HeaderComponent, HeaderDirective],
      template: '',
    })
    class MainComponent {}

    const deps = ɵɵgetComponentDepsFactory(
      MainComponent as ComponentType<any>,
      [HeaderComponent, HeaderDirective],
      [
        {type: HeaderComponent, qualifiedNames: ['Card.Header']},
        {type: HeaderDirective, qualifiedNames: ['Card.HeaderDirective']},
      ],
    )();

    expect(deps).toContain(HeaderDirective);
    expect(deps).not.toContain(HeaderComponent);

    const qualifiedHeader = deps.find(
      (dep) => typeof dep === 'object' && dep !== null && 'type' in dep,
    ) as {type: unknown; qualifiedNames: string[]};
    expect(qualifiedHeader).toEqual({
      type: HeaderComponent,
      qualifiedNames: ['Card.Header'],
    });

    const defs = extractDefListOrFactory(deps, extractDirectiveDef) as NonNullable<
      ReturnType<typeof extractDefListOrFactory>
    >;
    expect(typeof defs).not.toBe('function');

    const resolvedDefs = defs as ReturnType<typeof extractDirectiveDef>[];
    const qualifiedDef = resolvedDefs.find((def) => def?.type === HeaderComponent)!;
    const directiveDef = resolvedDefs.find((def) => def?.type === HeaderDirective)!;

    expect(qualifiedDef.selectors).toContain(['Card.Header']);
    expect(directiveDef.selectors).not.toContain(['Card.HeaderDirective']);
    expect(getComponentDef(HeaderComponent)!.selectors).not.toContain(['Card.Header']);
  });

  it('should preserve multiple qualified names without mutating the component definition', () => {
    @Component({selector: 'card-header', template: ''})
    class HeaderComponent {}

    @Component({imports: [HeaderComponent], template: ''})
    class MainComponent {}

    const deps = ɵɵgetComponentDepsFactory(
      MainComponent as ComponentType<any>,
      [HeaderComponent],
      [
        {type: HeaderComponent, qualifiedNames: ['Card.Header']},
        {type: HeaderComponent, qualifiedNames: ['UI.Card.Header']},
      ],
    )();

    const defs = extractDefListOrFactory(deps, extractDirectiveDef) as ReturnType<
      typeof extractDirectiveDef
    >[];
    const qualifiedDef = defs.find((def) => def?.type === HeaderComponent)!;

    expect(qualifiedDef.selectors).toContain(['Card.Header']);
    expect(qualifiedDef.selectors).toContain(['UI.Card.Header']);
    expect(getComponentDef(HeaderComponent)!.selectors).toEqual([['card-header']]);
  });
});

describe('component bootstrap info', () => {
  it('should include the bootstrap info in local compilation mode', () => {
    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {declarations: [MainComponent], bootstrap: [MainComponent]});
    const def = getNgModuleDef(MainModule);

    expect(def?.bootstrap).toEqual([MainComponent]);
  });

  it('should flatten the bootstrap info in local compilation mode', () => {
    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule});
    }
    ɵɵsetNgModuleScope(MainModule, {declarations: [MainComponent], bootstrap: [[[MainComponent]]]});
    const def = getNgModuleDef(MainModule);

    expect(def?.bootstrap).toEqual([MainComponent]);
  });

  it('should include the bootstrap info in full compilation mode', () => {
    @Component({
      standalone: false,
    })
    class MainComponent {}

    class MainModule {
      static ɵmod = ɵɵdefineNgModule({type: MainModule, bootstrap: [MainComponent]});
    }
    ɵɵsetNgModuleScope(MainModule, {declarations: [MainComponent]});
    const def = getNgModuleDef(MainModule);

    expect(def?.bootstrap).toEqual([MainComponent]);
  });
});
