/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {InjectionToken, Injector} from '@angular/core';
import {MyInterface, TOKEN} from '../main';

describe('InjectionToken Example', () => {
  it('should create and inject token with correct type', () => {
    const providers = [{provide: TOKEN, useValue: {someProperty: 'exampleValue'}}];
    const injector = Injector.create({providers});
    const myInterface = injector.get(TOKEN);

    expect(myInterface).toBeDefined();
    expect(myInterface.someProperty).toBe('exampleValue');
    expect(myInterface.someProperty).toEqual(jasmine.any(String));
  });

  it('should throw error when token is not provided', () => {
    const injector = Injector.create({providers: []});

    expect(() => {
      injector.get(TOKEN);
    }).toThrowError(/NG0201.*No provider found for.*InjectionToken SomeToken/);
  });

  it('should return null when token is optional and not provided', () => {
    const injector = Injector.create({providers: []});

    const result = injector.get(TOKEN, null);
    expect(result).toBeNull();
  });

  it('should work with multiple providers', () => {
    const TOKEN1 = new InjectionToken<string>('Token1');
    const TOKEN2 = new InjectionToken<number>('Token2');

    const providers = [
      {provide: TOKEN1, useValue: 'string value'},
      {provide: TOKEN2, useValue: 42},
    ];

    const injector = Injector.create({providers});

    expect(injector.get(TOKEN1)).toBe('string value');
    expect(injector.get(TOKEN2)).toBe(42);
  });

  it('should use factory provider', () => {
    const FACTORY_TOKEN = new InjectionToken<MyInterface>('FactoryToken');

    const providers = [
      {
        provide: FACTORY_TOKEN,
        useFactory: () => ({someProperty: 'from factory'}),
      },
    ];

    const injector = Injector.create({providers});
    const result = injector.get(FACTORY_TOKEN);

    expect(result.someProperty).toBe('from factory');
  });

  it('should work with TestBed', () => {
    TestBed.configureTestingModule({
      providers: [{provide: TOKEN, useValue: {someProperty: 'testBed value'}}],
    });

    const result = TestBed.inject(TOKEN);
    expect(result.someProperty).toBe('testBed value');
  });
});
