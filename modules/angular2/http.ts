import {bind, Binding} from 'angular2/di';
import {Http, HttpFactory} from './src/http/http';
import {XHRBackend} from 'angular2/src/http/backends/xhr_backend';
import {BrowserXHR} from 'angular2/src/http/backends/browser_xhr';

export {Http};
export var httpInjectables: List<any> = [
  XHRBackend,
  bind(BrowserXHR).toValue(BrowserXHR),
  bind(Http).toFactory(HttpFactory, [XHRBackend])
];
