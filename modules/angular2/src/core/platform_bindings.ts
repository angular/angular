import {bind} from 'angular2/di';
import {ExceptionHandler} from './exception_handler';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

export const EXCEPTION_BINDING =
    bind(ExceptionHandler).toFactory(() => new ExceptionHandler(DOM, false), []);
