import { ComponentFactory, ComponentFactoryResolver, ComponentRef, NgModuleFactoryLoader } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockNgModuleFactoryLoader, TestEmbedComponentsService, TestModule, mockEmbeddedModulePath,
  testEagerEmbeddedComponents, testEagerEmbeddedSelectors, testLazyEmbeddedComponents
} from 'testing/embed-components-utils';
import { EmbedComponentsService, ComponentsOrModulePath } from './embed-components.service';


describe('EmbedComponentsService', () => {
  let service: TestEmbedComponentsService;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TestModule]});

    service = TestBed.get(EmbedComponentsService);
    host = document.createElement('div');
  });

  it('should be instantiated', () => {
    expect(service).toEqual(jasmine.any(EmbedComponentsService));
  });

  describe('#createComponentFactories()', () => {
    let factories: typeof service.componentFactories;
    let resolver: ComponentFactoryResolver;

    const doCreateComponentFactories = () =>
      service.createComponentFactories(testEagerEmbeddedComponents, resolver);

    beforeEach(() => {
      factories = service.componentFactories;
      resolver = TestBed.get(ComponentFactoryResolver) as ComponentFactoryResolver;
    });

    it('should create a factory entry for each component', () => {
      expect(factories.size).toBe(0);

      doCreateComponentFactories();
      expect(factories.size).toBe(testEagerEmbeddedComponents.length);
    });

    it('should key the factory entries by selector', () => {
      doCreateComponentFactories();

      const actualSelectors = Array.from(factories.keys());
      const expectedSelectors = testEagerEmbeddedSelectors;

      expect(actualSelectors).toEqual(expectedSelectors);
    });

    it('should store the projected content property name', () => {
      doCreateComponentFactories();

      const actualContentPropNames = Array.from(factories.values()).map(x => x.contentPropertyName);
      const expectedContentPropNames = testEagerEmbeddedSelectors.map(x => service.selectorToContentPropertyName(x));

      expect(actualContentPropNames).toEqual(expectedContentPropNames);
    });

    it('should store the factory for each component', () => {
      doCreateComponentFactories();

      const actualFactories = Array.from(factories.values()).map(x => x.factory);
      const expectedComponentTypes = testEagerEmbeddedComponents;

      actualFactories.forEach((factory, i) => {
        expect(factory).toEqual(jasmine.any(ComponentFactory));
        expect(factory.componentType).toBe(expectedComponentTypes[i]);
      });
    });
  });

  describe('#createComponents()', () => {
    const FooComponent = testEagerEmbeddedComponents[0];
    const BarComponent = testEagerEmbeddedComponents[1];

    beforeEach(() => service.prepareComponentFactories(testEagerEmbeddedComponents));

    it('should apply all embedded components (and return the `ComponentRef`s)', () => {
      host.innerHTML = `
        <p>Header</p>
        <p><aio-eager-foo></aio-eager-foo></p>
        <p><aio-eager-bar></aio-eager-bar></p>
        <p>Footer</p>
      `;

      const componentRefs = service.createComponents(host);

      expect(host.innerHTML).toContain('Foo Component');
      expect(host.innerHTML).toContain('Bar Component');

      expect(componentRefs.length).toBe(2);
      expect(componentRefs[0].instance).toEqual(jasmine.any(FooComponent));
      expect(componentRefs[1].instance).toEqual(jasmine.any(BarComponent));
    });

    it('should apply embedded components to all matching elements', () => {
      host.innerHTML = `
        <p>Header</p>
        <p><aio-eager-foo></aio-eager-foo></p>
        <p><aio-eager-bar></aio-eager-bar></p>
        <p><aio-eager-foo></aio-eager-foo></p>
        <p><aio-eager-bar></aio-eager-bar></p>
        <p>Footer</p>
      `;

      const componentRefs = service.createComponents(host);

      expect(componentRefs.length).toBe(4);
      expect(componentRefs[0].instance).toEqual(jasmine.any(FooComponent));
      expect(componentRefs[1].instance).toEqual(jasmine.any(FooComponent));
      expect(componentRefs[2].instance).toEqual(jasmine.any(BarComponent));
      expect(componentRefs[3].instance).toEqual(jasmine.any(BarComponent));
    });

    it('should allow projecting content by assigning it on the element', () => {
      const projectedContent = 'Projected content';
      host.innerHTML = `
        <p>Header</p>
        <p><aio-eager-bar>${projectedContent}</aio-eager-bar></p>
        <p>Footer</p>
      `;

      const componentRefs = service.createComponents(host);
      componentRefs[0].changeDetectorRef.detectChanges();

      const barEl = host.querySelector('aio-eager-bar')!;

      expect((barEl as any)['aioEagerBarContent']).toBe(projectedContent);
      expect(barEl.innerHTML).toContain(projectedContent);
    });

    // Because `FooComponent` is processed before `BarComponent`...
    it('should apply `FooComponent` within `BarComponent`', () => {
      host.innerHTML = `
        <aio-eager-bar>
          <aio-eager-foo></aio-eager-foo>
        </aio-eager-bar>
      `;

      const componentRefs = service.createComponents(host);
      componentRefs.forEach(ref => ref.changeDetectorRef.detectChanges());

      expect(host.innerHTML).toContain('Foo Component');
      expect(host.innerHTML).toContain('Bar Component');

      expect(componentRefs.length).toBe(2);
      expect(componentRefs[0].instance).toEqual(jasmine.any(FooComponent));
      expect(componentRefs[1].instance).toEqual(jasmine.any(BarComponent));
    });

    // Because `BarComponent` is processed after `FooComponent`...
    it('should not apply `BarComponent` within `FooComponent`', () => {
      host.innerHTML = `
        <aio-eager-foo>
          <aio-eager-bar></aio-eager-bar>
        </aio-eager-foo>
      `;

      const componentRefs = service.createComponents(host);
      componentRefs.forEach(ref => ref.changeDetectorRef.detectChanges());

      expect(host.innerHTML).toContain('Foo Component');
      expect(host.innerHTML).not.toContain('Bar Component');

      expect(componentRefs.length).toBe(1);
      expect(componentRefs[0].instance).toEqual(jasmine.any(FooComponent));
    });
  });

  describe('#embedInto()', () => {
    let mockComponentRefs: ComponentRef<any>[];
    let createComponentsSpy: jasmine.Spy;
    let prepareComponentFactoriesSpy: jasmine.Spy;

    const doEmbed = (contents: string) =>
      new Promise<ComponentRef<any>[]>((resolve, reject) => {
        host.innerHTML = contents;
        service.embedInto(host).subscribe(resolve, reject);
      });

    beforeEach(() => {
      mockComponentRefs = [{foo: true}, {bar: true}] as any as ComponentRef<any>[];

      createComponentsSpy = spyOn(service, 'createComponents').and.returnValue(mockComponentRefs);
      prepareComponentFactoriesSpy = spyOn(service, 'prepareComponentFactories')
                                         .and.returnValue(Promise.resolve());
    });

    it('should return an observable', done => {
      service.embedInto(host).subscribe(done, done.fail);
    });

    describe('(preparing component factories)', () => {
      it('should return an array of `ComponentRef`s', async () => {
        // When there are embedded components.
        expect(await doEmbed('<aio-eager-foo></aio-eager-foo>')).toEqual(mockComponentRefs);
        expect(await doEmbed('<aio-lazy-bar></aio-lazy-bar>')).toEqual(mockComponentRefs);

        // When there are no embedded components.
        expect(await doEmbed('<div>Test</div>')).toEqual([]);
        expect(await doEmbed('')).toEqual([]);
      });

      it('should prepare all component factories if there are embedded components', async () => {
        await doEmbed(`
          <div><aio-eager-foo><b>foo</b></aio-eager-foo></div>
          <span><aio-lazy-foo><i>bar</i></aio-lazy-foo></span>
        `);

        expect(prepareComponentFactoriesSpy).toHaveBeenCalledTimes(2);
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledWith(testEagerEmbeddedComponents);
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledWith(mockEmbeddedModulePath);
      });

      it('should only prepare the necessary factories', async () => {
        await doEmbed('<aio-eager-foo>Eager only</aio-eager-foo>');
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledTimes(1);
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledWith(testEagerEmbeddedComponents);

        await doEmbed('<aio-lazy-foo>Lazy only</aio-lazy-foo>');
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledTimes(2);
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledWith(mockEmbeddedModulePath);
      });

      it('should not load embedded components if the document does not contain any', async () => {
        await doEmbed('');
        await doEmbed('<no-aio-eager-foo></no-aio-eager-foo>');
        await doEmbed('<no-aio-lazy-foo></no-aio-lazy-foo>');

        expect(prepareComponentFactoriesSpy).not.toHaveBeenCalled();
      });
    });

    describe('(creating embedded components)', () => {
      it('should create embedded components if the element contains any', async () => {
        await doEmbed('<div><aio-eager-foo><i>blah</i></aio-eager-foo></div>');

        expect(createComponentsSpy).toHaveBeenCalledTimes(1);
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledBefore(createComponentsSpy);

        prepareComponentFactoriesSpy.calls.reset();
        createComponentsSpy.calls.reset();

        await doEmbed('<aio-lazy-bar><i>blah</i></aio-lazy-bar>');
        expect(createComponentsSpy).toHaveBeenCalledTimes(1);
        expect(prepareComponentFactoriesSpy).toHaveBeenCalledBefore(createComponentsSpy);
      });

      it('should emit the created embedded components', async () => {
        const componentRefs = await doEmbed('<aio-eager-foo></aio-eager-foo>');
        expect(componentRefs).toBe(mockComponentRefs);
      });

      it('should not create embedded components if the element does not contain any', async () => {
        await doEmbed(`
          <aio-eager-foo-not></aio-eager-foo-not>
          &lt;aio-lazy-bar&gt;&lt;/aio-lazy-bar&gt;
        `);
        expect(createComponentsSpy).not.toHaveBeenCalled();
      });

      it('should not create embedded components if the document is empty', async () => {
        await doEmbed('');
        expect(createComponentsSpy).not.toHaveBeenCalled();
      });

      it('should not create embedded components if unsubscribed from', async () => {
        const preparePromise = Promise.resolve();
        prepareComponentFactoriesSpy.and.returnValue(preparePromise);

        // When not unsubscribed from...
        host.innerHTML = '<aio-eager-foo></aio-eager-foo>';
        service.embedInto(host).subscribe();
        await new Promise(resolve => setTimeout(resolve));
        expect(createComponentsSpy).toHaveBeenCalledTimes(1);

        createComponentsSpy.calls.reset();

        // When unsubscribed from...
        host.innerHTML = '<aio-eager-foo></aio-eager-foo>';
        service.embedInto(host).subscribe().unsubscribe();
        await new Promise(resolve => setTimeout(resolve));
        expect(createComponentsSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('#prepareComponentFactories()', () => {
    let loader: MockNgModuleFactoryLoader;
    let resolver: ComponentFactoryResolver;
    let createComponentFactoriesSpy: jasmine.Spy;

    beforeEach(() => {
      loader = TestBed.get(NgModuleFactoryLoader);
      resolver = TestBed.get(ComponentFactoryResolver);

      createComponentFactoriesSpy = spyOn(service, 'createComponentFactories');
    });

    [testLazyEmbeddedComponents, mockEmbeddedModulePath].forEach((compsOrPath: ComponentsOrModulePath) => {
      const useComponents = Array.isArray(compsOrPath);

      describe(`(using ${useComponents ? 'component types' : 'module path'})`, () => {
        const doPrepareComponentFactories = () =>
          service.prepareComponentFactories(compsOrPath);

        it('should return a promise', done => {
          doPrepareComponentFactories().then(done, done.fail);
        });

        it('should create the component factories', async () => {
          expect(createComponentFactoriesSpy).not.toHaveBeenCalled();

          await doPrepareComponentFactories();
          expect(createComponentFactoriesSpy).toHaveBeenCalledTimes(1);

          const args = createComponentFactoriesSpy.calls.mostRecent().args;
          expect(args[0]).toBe(testLazyEmbeddedComponents);

          if (useComponents) {
            expect(args[1]).toBe(resolver);
          } else {
            expect(args[1]).not.toBe(resolver);
          }
        });

        it('should not create create the component factories more than once', async () => {
          const results = await Promise.all([
            doPrepareComponentFactories(),
            doPrepareComponentFactories(),
          ]);

          expect(createComponentFactoriesSpy).toHaveBeenCalledTimes(1);
          expect(results[1]).toBe(results[0]);

          const anotherResult = await doPrepareComponentFactories();

          expect(createComponentFactoriesSpy).toHaveBeenCalledTimes(1);
          expect(anotherResult).toBe(results[0]);
        });

        it(`should ${useComponents ? 'not load' : 'load'} the embedded module`, async () => {
          expect(loader.loadedPaths).toEqual([]);

          await doPrepareComponentFactories();
          const expectedLoadedPaths = useComponents ? [] : [mockEmbeddedModulePath];

          expect(loader.loadedPaths).toEqual(expectedLoadedPaths);
        });

        it(`should not load the embedded module more than once`, async () => {
          await Promise.all([
            doPrepareComponentFactories(),
            doPrepareComponentFactories(),
          ]);
          const loadedPathCount = loader.loadedPaths.length;

          expect(loadedPathCount).toBeLessThan(2);

          await doPrepareComponentFactories();

          expect(loader.loadedPaths.length).toBe(loadedPathCount);
        });
      });
    });
  });

  describe('#selectorToContentPropertyName()', () => {
    it('should convert an element selector to a property name', () => {
      expect(service.selectorToContentPropertyName('foobar')).toBe('foobarContent');
      expect(service.selectorToContentPropertyName('baz-qux')).toBe('bazQuxContent');
    });
  });
});
