import { ReflectiveInjector } from '@angular/core';

import { Global, globalProvider } from './global.value';


describe('Global', () => {
  let value: any;

  beforeEach(() => {
    const injector = ReflectiveInjector.resolveAndCreate([globalProvider]);
    value = injector.get(Global);
  });


  it('should be `window`', () => {
    expect(value).toBe(window);
  });
});
