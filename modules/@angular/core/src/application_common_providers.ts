import {Type} from '../src/facade/lang';
import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {APPLICATION_CORE_PROVIDERS} from './application_ref';
import {
  IterableDiffers,
  defaultIterableDiffers,
  KeyValueDiffers,
  defaultKeyValueDiffers
} from './change_detection/change_detection';
import {ViewUtils} from './linker/view_utils';
import {ComponentResolver, ReflectorComponentResolver} from './linker/component_resolver';
import {DynamicComponentLoader, DynamicComponentLoader_} from './linker/dynamic_component_loader';

let __unused: Type;  // avoid unused import when Type union types are erased

/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 */
export const APPLICATION_COMMON_PROVIDERS: Array<Type | {[k: string]: any} | any[]> =
    /*@ts2dart_const*/[
      APPLICATION_CORE_PROVIDERS,
      /* @ts2dart_Provider */ {provide: ComponentResolver, useClass: ReflectorComponentResolver},
      APP_ID_RANDOM_PROVIDER,
      ViewUtils,
      /* @ts2dart_Provider */ {provide: IterableDiffers, useValue: defaultIterableDiffers},
      /* @ts2dart_Provider */ {provide: KeyValueDiffers, useValue: defaultKeyValueDiffers},
      /* @ts2dart_Provider */ {provide: DynamicComponentLoader, useClass: DynamicComponentLoader_}
    ];
