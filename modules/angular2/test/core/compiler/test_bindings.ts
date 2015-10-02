import {bind, Binding} from 'angular2/src/core/di';
import {MockSchemaRegistry} from './schema_registry_mock';
import {ElementSchemaRegistry} from 'angular2/src/core/compiler/schema/element_schema_registry';

export var TEST_BINDINGS = [bind(ElementSchemaRegistry).toValue(new MockSchemaRegistry({}, {}))];
