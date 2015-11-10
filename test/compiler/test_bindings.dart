library angular2.test.compiler.test_bindings;

import "package:angular2/src/core/di.dart" show provide, Provider;
import "schema_registry_mock.dart" show MockSchemaRegistry;
import "package:angular2/src/compiler/schema/element_schema_registry.dart"
    show ElementSchemaRegistry;
import "package:angular2/src/compiler/xhr_mock.dart" show MockXHR;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/compiler/url_resolver.dart"
    show UrlResolver, createWithoutPackagePrefix;

var TEST_PROVIDERS = [
  provide(ElementSchemaRegistry, useValue: new MockSchemaRegistry({}, {})),
  provide(XHR, useClass: MockXHR),
  provide(UrlResolver, useFactory: createWithoutPackagePrefix)
];
