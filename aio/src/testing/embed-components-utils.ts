import {
  Component, ComponentFactoryResolver, ComponentRef, CompilerFactory, ElementRef, NgModule,
  NgModuleFactoryLoader, OnInit, Type, ViewChild, getPlatform
} from '@angular/core';

import {
  ComponentsOrModulePath, EMBEDDED_COMPONENTS, EmbedComponentsService, EmbeddedComponentFactory,
  WithEmbeddedComponents
} from 'app/embed-components/embed-components.service';


////////////////////////////////////////////////////////////////////////////////////////////////////
/// `TestEmbedComponentsService` (for exposing internal methods as public).                      ///
/// Only used for type-casting; the actual implementation is irrelevant.                         ///
////////////////////////////////////////////////////////////////////////////////////////////////////

export class TestEmbedComponentsService extends EmbedComponentsService {
  componentFactories: Map<string, EmbeddedComponentFactory>;

  createComponentFactories(components: Type<any>[], resolver: ComponentFactoryResolver): void { return null as any; }
  createComponents(elem: HTMLElement): ComponentRef<any>[] { return null as any; }
  prepareComponentFactories(compsOrPath: ComponentsOrModulePath): Promise<void> { return null as any; }
  selectorToContentPropertyName(selector: string): string { return null as any; }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
/// Mock `EmbeddedModule` and test components.                                                   ///
////////////////////////////////////////////////////////////////////////////////////////////////////

// Test embedded components.
@Component({
  selector: 'aio-eager-foo',
  template: `Eager Foo Component`,
})
class EagerFooComponent { }

@Component({
  selector: 'aio-eager-bar',
  template: `
    <hr>
    <h2>Eager Bar Component</h2>
    <p #content></p>
    <hr>
  `,
})
class EagerBarComponent implements OnInit {
  @ViewChild('content') contentRef: ElementRef;

  constructor(public elementRef: ElementRef) { }

  // Project content in `ngOnInit()` just like in `CodeExampleComponent`.
  ngOnInit() {
    // Security: This is a test component; never deployed.
    this.contentRef.nativeElement.innerHTML = this.elementRef.nativeElement.aioEagerBarContent;
  }
}

@Component({
  selector: 'aio-lazy-foo',
  template: `Lazy Foo Component`,
})
class LazyFooComponent { }

@Component({
  selector: 'aio-lazy-bar',
  template: `
    <hr>
    <h2>Lazy Bar Component</h2>
    <p #content></p>
    <hr>
  `,
})
class LazyBarComponent implements OnInit {
  @ViewChild('content') contentRef: ElementRef;

  constructor(public elementRef: ElementRef) { }

  // Project content in `ngOnInit()` just like in `CodeExampleComponent`.
  ngOnInit() {
    // Security: This is a test component; never deployed.
    this.contentRef.nativeElement.innerHTML = this.elementRef.nativeElement.aioLazyBarContent;
  }
}

// Export test embedded selectors and components.
export const testEagerEmbeddedSelectors = ['aio-eager-foo', 'aio-eager-bar'];
export const testEagerEmbeddedComponents = [EagerFooComponent, EagerBarComponent];
export const testLazyEmbeddedSelectors = ['aio-lazy-foo', 'aio-lazy-bar'];
export const testLazyEmbeddedComponents = [LazyFooComponent, LazyBarComponent];

// Export mock `EmbeddedModule` and path.
export const mockEmbeddedModulePath = 'mock/mock-embedded#MockEmbeddedModule';

@NgModule({
  declarations: [testLazyEmbeddedComponents],
  entryComponents: [testLazyEmbeddedComponents],
})
class MockEmbeddedModule implements WithEmbeddedComponents {
  embeddedComponents = testLazyEmbeddedComponents;
}


////////////////////////////////////////////////////////////////////////////////////////////////////
/// `TestModule`.                                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////

// Mock services.
export class MockNgModuleFactoryLoader implements NgModuleFactoryLoader {
  loadedPaths: string[] = [];

  load(path: string) {
    this.loadedPaths.push(path);

    const platformRef = getPlatform();
    const compilerFactory = platformRef!.injector.get(CompilerFactory) as CompilerFactory;
    const compiler = compilerFactory.createCompiler([]);

    return compiler.compileModuleAsync(MockEmbeddedModule);
  }
}

@NgModule({
  providers: [
    EmbedComponentsService,
    { provide: NgModuleFactoryLoader, useClass: MockNgModuleFactoryLoader },
    {
      provide: EMBEDDED_COMPONENTS,
      useValue: {
        [testEagerEmbeddedSelectors.join(',')]: testEagerEmbeddedComponents,
        [testLazyEmbeddedSelectors.join(',')]: mockEmbeddedModulePath,
      },
    },
  ],
  declarations: [testEagerEmbeddedComponents],
  entryComponents: [testEagerEmbeddedComponents],
})
export class TestModule { }
