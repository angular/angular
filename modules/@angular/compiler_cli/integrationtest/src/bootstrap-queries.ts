import {coreBootstrap, ReflectiveInjector} from '@angular/core';
import {browserPlatform, BROWSER_APP_PROVIDERS} from '@angular/platform-browser';
import {CompWithQueryNgFactory} from './queries.ngfactory';
import {CompWithQuery} from './queries';

const appInjector =
    ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS, browserPlatform().injector);
coreBootstrap(CompWithQueryNgFactory, appInjector);
