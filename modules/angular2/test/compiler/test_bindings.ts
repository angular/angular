import {provide, Provider} from 'angular2/src/core/di';
import {MockSchemaRegistry} from './schema_registry_mock';
import {ElementSchemaRegistry} from 'angular2/src/compiler/schema/element_schema_registry';
import {MockXHR} from 'angular2/src/compiler/xhr_mock';
import {XHR} from 'angular2/src/compiler/xhr';
import {
  UrlResolver,
  createUrlResolverWithoutPackagePrefix
} from 'angular2/src/compiler/url_resolver';

export var TEST_PROVIDERS = [
  provide(ElementSchemaRegistry, {useValue: new MockSchemaRegistry({}, {})}),
  provide(XHR, {useClass: MockXHR}),
  provide(UrlResolver, {useFactory: createUrlResolverWithoutPackagePrefix})
];
