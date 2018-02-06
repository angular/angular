import { TestBed } from '@angular/core/testing';
import { AppModule } from 'app/app.module';
import { ComponentsOrModulePath, EMBEDDED_COMPONENTS } from 'app/embed-components/embed-components.service';
import { embeddedComponents } from 'app/embedded/embedded.module';

describe('AppModule', () => {
  let componentsMap: {[multiSelectorstring: string]: ComponentsOrModulePath};

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [AppModule]});
    componentsMap = TestBed.get(EMBEDDED_COMPONENTS);
  });

  it('should provide a map of selectors to embedded components (or module)', () => {
    const allSelectors = Object.keys(componentsMap);

    expect(allSelectors.length).toBeGreaterThan(1);
    allSelectors.forEach(selector => {
      const value = componentsMap[selector];
      const isArrayOrString = Array.isArray(value) || (typeof value === 'string');
      expect(isArrayOrString).toBe(true);
    });
  });

  it('should provide a list of eagerly-loaded embedded components', () => {

    const eagerConfig = Object.keys(componentsMap).filter(selector => Array.isArray(componentsMap[selector]));
    expect(eagerConfig.length).toBeGreaterThan(0);

    const eagerSelectors = eagerConfig.reduce<string[]>((selectors, config) => selectors.concat(config.split(',')), []);
    expect(eagerSelectors.length).toBeGreaterThan(0);

    // For example...
    expect(eagerSelectors).toContain('aio-toc');
    expect(eagerSelectors).toContain('aio-announcement-bar');
  });

  it('should provide a list of lazy-loaded embedded components', () => {
    const lazySelector = Object.keys(componentsMap).find(selector => selector.includes('code-example'))!;
    const selectorCount = lazySelector.split(',').length;

    expect(lazySelector).not.toBeNull();
    expect(selectorCount).toBe(embeddedComponents.length);

    // For example...
    expect(lazySelector).toContain('code-example');
    expect(lazySelector).toContain('code-tabs');
    expect(lazySelector).toContain('live-example');
  });
});
