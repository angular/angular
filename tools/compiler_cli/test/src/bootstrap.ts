import {coreBootstrap, ReflectiveInjector} from 'angular2/core';
import {browserPlatform, BROWSER_APP_PROVIDERS} from 'angular2/platform/browser';
import {BasicNgFactory} from './basic.ngfactory';
import {Basic} from './basic';

const appInjector =
    ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, browserPlatform().injector);
coreBootstrap(appInjector, BasicNgFactory);
