var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConnectionBackend } from '../interfaces';
import { ReadyStates, RequestMethods, ResponseTypes } from '../enums';
import { Response } from '../static_response';
import { ResponseOptions } from '../base_response_options';
import { Injectable } from 'angular2/angular2';
import { BrowserJsonp } from './browser_jsonp';
import { makeTypeError } from 'angular2/src/facade/exceptions';
import { StringWrapper, isPresent } from 'angular2/src/facade/lang';
import { Observable } from 'angular2/angular2';
const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use GET request method.';
export class JSONPConnection {
}
export class JSONPConnection_ extends JSONPConnection {
    constructor(req, _dom, baseResponseOptions) {
        super();
        this._dom = _dom;
        this.baseResponseOptions = baseResponseOptions;
        this._finished = false;
        if (req.method !== RequestMethods.Get) {
            throw makeTypeError(JSONP_ERR_WRONG_METHOD);
        }
        this.request = req;
        this.response = new Observable(responseObserver => {
            this.readyState = ReadyStates.Loading;
            let id = this._id = _dom.nextRequestID();
            _dom.exposeConnection(id, this);
            // Workaround Dart
            // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
            let callback = _dom.requestCallback(this._id);
            let url = req.url;
            if (url.indexOf('=JSONP_CALLBACK&') > -1) {
                url = StringWrapper.replace(url, '=JSONP_CALLBACK&', `=${callback}&`);
            }
            else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
                url = url.substring(0, url.length - '=JSONP_CALLBACK'.length) + `=${callback}`;
            }
            let script = this._script = _dom.build(url);
            let onLoad = event => {
                if (this.readyState === ReadyStates.Cancelled)
                    return;
                this.readyState = ReadyStates.Done;
                _dom.cleanup(script);
                if (!this._finished) {
                    let responseOptions = new ResponseOptions({ body: JSONP_ERR_NO_CALLBACK, type: ResponseTypes.Error });
                    if (isPresent(baseResponseOptions)) {
                        responseOptions = baseResponseOptions.merge(responseOptions);
                    }
                    responseObserver.error(new Response(responseOptions));
                    return;
                }
                let responseOptions = new ResponseOptions({ body: this._responseData });
                if (isPresent(this.baseResponseOptions)) {
                    responseOptions = this.baseResponseOptions.merge(responseOptions);
                }
                responseObserver.next(new Response(responseOptions));
                responseObserver.complete();
            };
            let onError = error => {
                if (this.readyState === ReadyStates.Cancelled)
                    return;
                this.readyState = ReadyStates.Done;
                _dom.cleanup(script);
                let responseOptions = new ResponseOptions({ body: error.message, type: ResponseTypes.Error });
                if (isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                responseObserver.error(new Response(responseOptions));
            };
            script.addEventListener('load', onLoad);
            script.addEventListener('error', onError);
            _dom.send(script);
            return () => {
                this.readyState = ReadyStates.Cancelled;
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
                if (isPresent(script)) {
                    this._dom.cleanup(script);
                }
            };
        });
    }
    finished(data) {
        // Don't leak connections
        this._finished = true;
        this._dom.removeConnection(this._id);
        if (this.readyState === ReadyStates.Cancelled)
            return;
        this._responseData = data;
    }
}
export class JSONPBackend extends ConnectionBackend {
}
export let JSONPBackend_ = class extends JSONPBackend {
    constructor(_browserJSONP, _baseResponseOptions) {
        super();
        this._browserJSONP = _browserJSONP;
        this._baseResponseOptions = _baseResponseOptions;
    }
    createConnection(request) {
        return new JSONPConnection_(request, this._browserJSONP, this._baseResponseOptions);
    }
};
JSONPBackend_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [BrowserJsonp, ResponseOptions])
], JSONPBackend_);
//# sourceMappingURL=jsonp_backend.js.map