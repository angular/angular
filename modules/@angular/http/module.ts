import {AppModule} from '@angular/core';
import {HTTP_PROVIDERS, JSONP_PROVIDERS} from './http';

/**
 * @stable
 */
@AppModule({
  providers: HTTP_PROVIDERS
})
export class HttpModule{}

/**
 * @stable
 */
@AppModule({
  providers: JSONP_PROVIDERS
})
export class JsonpModule{}
