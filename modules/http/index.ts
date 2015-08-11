require('reflect-metadata');
require('traceur-runtime');
import {HTTP_BINDINGS, JSONP_BINDINGS, Http, Jsonp} from './http';
import {Injector} from 'angular2/angular2';
export * from './http';

/**
 * TODO(jeffbcross): export each as their own top-level file, to require as:
 * require('http/http'); require('http/jsonp');
 */
export var http = Injector.resolveAndCreate([HTTP_BINDINGS]).get(Http);
export var jsonp = Injector.resolveAndCreate([JSONP_BINDINGS]).get(Jsonp);
