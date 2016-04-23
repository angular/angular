import {
  ApplicationRef,
  Injectable,
  ComponentRef,
  ComponentFactory,
  Injector,
  NgZone
} from '@angular/core';
import {Type} from './facade/lang';

/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
@Injectable()
export class MockApplicationRef extends ApplicationRef {
  registerBootstrapListener(listener: (ref: ComponentRef) => void): void {}

  registerDisposeListener(dispose: () => void): void {}

  bootstrap(componentFactory: ComponentFactory): ComponentRef { return null; }

  get injector(): Injector { return null; };

  get zone(): NgZone { return null; };

  run(callback: Function): any { return null; }

  waitForAsyncInitializers(): Promise<any> { return null; }

  dispose(): void {}

  tick(): void {}

  get componentTypes(): Type[] { return null; };
}
