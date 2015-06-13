import {bind, Binding} from 'angular2/di';
import {Http, HttpFactory} from './src/http/http';
import {XHRBackend} from 'angular2/src/http/backends/xhr_backend';
import {BrowserXHR} from 'angular2/src/http/backends/browser_xhr';
import {BaseRequestOptions} from 'angular2/src/http/base_request_options';

export {Http};
export var httpInjectables: List<any> = [
  bind(BrowserXHR)
      .toValue(BrowserXHR),
  XHRBackend,
  BaseRequestOptions,
  bind(HttpFactory).toFactory(HttpFactory, [XHRBackend, BaseRequestOptions]),
  Http
];
