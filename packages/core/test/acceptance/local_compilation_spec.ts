/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  forwardRef,
  ɵɵdefineNgModule,
  ɵɵgetComponentDepsFactory,
  ɵɵsetNgModuleScope,
} from '../../src/core';
import {ComponentType} from '../../src/render3';
import {getNgModuleDef} from '../../src/render3/def_getters';

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

  it('should compute correct set of dependencies when importing ng-modules with providers using forward ref', () => {
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
