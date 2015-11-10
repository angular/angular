import {provide} from 'angular2/src/core/di';
import {Provider} from "angular2/src/core/di/provider";
import {ExceptionHandler} from 'angular2/src/facade/exceptions';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

export const EXCEPTION_PROVIDER: Provider =
    provide(ExceptionHandler, {useFactory: () => new ExceptionHandler(DOM, false), deps: []});

export const EXCEPTION_BINDING = EXCEPTION_PROVIDER;
