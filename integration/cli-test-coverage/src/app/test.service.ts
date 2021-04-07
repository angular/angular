import { Inject, Injectable, InjectionToken } from '@angular/core';

/**
 * The below setup defines the derived class `TestClass` with a field initializer to generate a
 * synthesized constructor, while extending from a class that relies on Angular DI to inject a
 * token. As `TestService` does not originally have a constructor, the class should be instantiated
 * using the base class' factory to allow the token to be injected. The synthesized constructor
 * should be recognized by Angular in order to properly generate the factory definition.
 *
 * This integration test in particular exercises this behavior when running unit tests with test
 * coverage enabled. Coverage instrumentation inserts coverage reporting statements into the
 * generated code, which changes the shape of synthesized constructors.
 *
 * @see https://github.com/angular/angular/issues/31337
 */

export const TEST_TOKEN = new InjectionToken<string>('TEST_TOKEN', {
  factory: () => 'Service injected token',
});

@Injectable()
export class BaseClass {
  constructor(@Inject(TEST_TOKEN) readonly value: string) {}
}

@Injectable({ providedIn: 'root' })
export class TestService extends BaseClass {
  // Force the generation of a synthetic constructor.
  synthesizeConstructor = true;
}
