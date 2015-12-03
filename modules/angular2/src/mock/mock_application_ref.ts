import {ApplicationRef} from 'angular2/src/core/application_ref';
import {Injectable} from 'angular2/src/core/di';
import {Type} from 'angular2/src/facade/lang';
import {ComponentRef} from 'angular2/src/core/linker/dynamic_component_loader';
import {Provider, Injector} from 'angular2/src/core/di';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {Promise} from 'angular2/src/facade/async';

/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
@Injectable()
export class MockApplicationRef extends ApplicationRef {
  registerBootstrapListener(listener: (ref: ComponentRef) => void): void {}

  registerDisposeListener(dispose: () => void): void {}

  bootstrap(componentType: Type, bindings?: Array<Type | Provider | any[]>): Promise<ComponentRef> {
    return null;
  }

  get injector(): Injector { return null; };

  get zone(): NgZone { return null; };

  dispose(): void {}

  tick(): void {}

  get componentTypes(): Type[] { return null; };
}
