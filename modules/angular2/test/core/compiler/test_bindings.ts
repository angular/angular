import {provide, Provider} from 'angular2/src/core/di';
import {MockSchemaRegistry} from './schema_registry_mock';
import {ElementSchemaRegistry} from 'angular2/src/core/compiler/schema/element_schema_registry';
import {MockXHR} from 'angular2/src/core/compiler/xhr_mock';
import {XHR} from 'angular2/src/core/compiler/xhr';

export var TEST_PROVIDERS = [
  provide(ElementSchemaRegistry, {useValue: new MockSchemaRegistry({}, {})}),
  provide(XHR, {useClass: MockXHR})
];
