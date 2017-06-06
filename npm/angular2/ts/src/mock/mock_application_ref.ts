import {ApplicationRef} from 'angular2/src/core/application_ref';
import {Injectable, Injector} from 'angular2/src/core/di';
import {Type} from 'angular2/src/facade/lang';
import {ComponentRef, ComponentFactory} from 'angular2/src/core/linker/component_factory';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
@Injectable()
export class MockApplicationRef extends ApplicationRef {
  registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void {}

  registerDisposeListener(dispose: () => void): void {}

  bootstrap<C>(componentFactory: ComponentFactory<C>): ComponentRef<C> { return null; }

  get injector(): Injector { return null; };

  get zone(): NgZone { return null; };

  run(callback: Function): any { return null; }

  waitForAsyncInitializers(): Promise<any> { return null; }

  dispose(): void {}

  tick(): void {}

  get componentTypes(): Type[] { return null; };
}
