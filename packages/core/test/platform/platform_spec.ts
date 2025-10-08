import {
  assertInInjectionContext,
  createPlatformFactory,
  destroyPlatform,
  EnvironmentInjector,
  inject,
  provideEnvironmentInitializer,
  providePlatformInitializer,
} from '@angular/core';

describe('Platform', () => {
  const platformTest = createPlatformFactory(null, 'test');

  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it('should create if no platform created', () => {
    const platform = platformTest();

    expect(platform).toBeTruthy();
  });

  it('should return existing platform', () => {
    const platform = platformTest();

    expect(platformTest()).toBe(platform);
  });

  it('should execute platform initializers', () => {
    const initializer = jasmine.createSpy('initializer');

    platformTest([
      providePlatformInitializer(() => {
        assertInInjectionContext(initializer);
        initializer();
      }),
    ]);

    expect(initializer).toHaveBeenCalled();
  });

  it('should execute environment initializers', () => {
    const initializer = jasmine.createSpy('initializer');

    platformTest([
      provideEnvironmentInitializer(() => {
        assertInInjectionContext(initializer);
        initializer();
      }),
    ]);

    expect(initializer).toHaveBeenCalled();
  });

  it('should have EnvironmentInjector', () => {
    const {injector} = platformTest([
      providePlatformInitializer(() => {
        inject(EnvironmentInjector);
      }),
    ]);

    expect(injector).toBeInstanceOf(EnvironmentInjector);
  });
});
