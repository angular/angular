import {
  InjectorResolver, NoInjectorAnnotationError
} from '@angular/compiler/src/injector_resolver';
import {InjectorMetadata, InjectorConfig, Injectable, Provides, Provider} from '@angular/core';
import {ddescribe, describe, it, iit, expect, beforeEach} from '@angular/core/testing';

@Injectable()
class SomeService {
}

@InjectorConfig({providers: [SomeService]})
class SomeConfig {
}

class SomeConfigWithoutMetadata {}

@InjectorConfig()
class SomeConfigWithProviderProperties {
  @Provides(SomeService)
  a: any;
}

@InjectorConfig()
class SomeConfigWithProviderGetter {
  @Provides(SomeService)
  get a(): any { return null; }
}

@InjectorConfig()
class SomeChildInjectorConfig extends SomeConfig {
}

export function main() {
  describe('InjectorResolver', () => {
    var resolver: InjectorResolver;

    beforeEach(() => { resolver = new InjectorResolver(); });

    it('should read out the Injector metadata', () => {
      var injectorMetadata = resolver.resolve(SomeConfig);
      expect(injectorMetadata).toEqual(new InjectorMetadata({providers: [SomeService]}));
    });

    it('should throw if not matching metadata is found', () => {
      expect(() => {
        resolver.resolve(SomeConfigWithoutMetadata);
      }).toThrow(new NoInjectorAnnotationError(SomeConfigWithoutMetadata));
    });

    it('should not read parent class Injector metadata', function() {
      var injectorMetadata = resolver.resolve(SomeChildInjectorConfig);
      expect(injectorMetadata).toEqual(new InjectorMetadata({providers: []}));
    });

    describe('provider properties', () => {
      it('should append provider properties', () => {
        var directiveMetadata = resolver.resolve(SomeConfigWithProviderProperties);
        expect(directiveMetadata.providers).toEqual([new Provider(
            SomeService, {useProperty: 'a'})]);
      });

      it('should work with getters', () => {
        var directiveMetadata = resolver.resolve(SomeConfigWithProviderGetter);
        expect(directiveMetadata.providers).toEqual([new Provider(
            SomeService, {useProperty: 'a'})]);
      });

    });
  });
}