import {InjectorModule} from 'angular2/core';
import {BROWSER_APP_PROVIDERS} from 'angular2/platform/browser_static';

@InjectorModule({providers: BROWSER_APP_PROVIDERS})
class AppModule {
}
