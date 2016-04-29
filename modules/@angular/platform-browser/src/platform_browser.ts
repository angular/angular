import {
  ReflectiveInjector,
  PlatformRef,
  getPlatform,
  createPlatform,
  assertPlatform
} from '@angular/core';
import {isBlank} from './facade/lang';
import {BROWSER_PROVIDERS, BROWSER_PLATFORM_MARKER} from './browser_common';
export {DomEventsPlugin} from './dom/events/dom_events';

export {EventManager, EVENT_MANAGER_PLUGINS} from './dom/events/event_manager';
export {ELEMENT_PROBE_PROVIDERS} from './dom/debug/ng_probe';
export {
  BROWSER_APP_COMMON_PROVIDERS,
  BROWSER_SANITIZATION_PROVIDERS,
  BROWSER_PROVIDERS,
  By,
  Title,
  enableDebugTools,
  disableDebugTools,
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig
} from './browser_common';

export * from '../private_export';
export {DOCUMENT} from './dom/dom_tokens';

export {DomSanitizationService, SecurityContext} from './security/dom_sanitization_service';

export {
  bootstrapStatic,
  browserStaticPlatform,
  BROWSER_APP_STATIC_PROVIDERS,
  BrowserPlatformLocation
} from './platform_browser_static';



export function browserPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS));
  }
  return assertPlatform(BROWSER_PLATFORM_MARKER);
}
