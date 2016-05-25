import {provide} from '@angular/core';
import {MockSchemaRegistry, MockXHR} from '@angular/compiler/testing';
import {ElementSchemaRegistry, XHR, UrlResolver} from '@angular/compiler';
import {createUrlResolverWithoutPackagePrefix} from '@angular/compiler/src/url_resolver';

export var TEST_PROVIDERS: any[] = [
  provide(ElementSchemaRegistry, {useValue: new MockSchemaRegistry({}, {})}),
  provide(XHR, {useClass: MockXHR}),
  provide(UrlResolver, {useFactory: createUrlResolverWithoutPackagePrefix})
];
