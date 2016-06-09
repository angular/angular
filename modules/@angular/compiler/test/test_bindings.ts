import {ElementSchemaRegistry, UrlResolver, XHR} from '@angular/compiler';
import {createUrlResolverWithoutPackagePrefix} from '@angular/compiler/src/url_resolver';
import {MockSchemaRegistry, MockXHR} from '@angular/compiler/testing';
import {provide} from '@angular/core';

export var TEST_PROVIDERS: any[] = [
  {provide: ElementSchemaRegistry, useValue: new MockSchemaRegistry({}, {})},
  {provide: XHR, useClass: MockXHR},
  {provide: UrlResolver, useFactory: createUrlResolverWithoutPackagePrefix}
];
