// #docplaster
// #docregion interceptor-providers
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// #enddocregion interceptor-providers
import { CustomJsonInterceptor , CustomJsonParser, JsonParser} from './custom-json-interceptor';

// #docregion interceptor-providers
import { AuthInterceptor } from './auth-interceptor';
import { CachingInterceptor } from './caching-interceptor';
import { EnsureHttpsInterceptor } from './ensure-https-interceptor';
import { LoggingInterceptor } from './logging-interceptor';
import { NoopInterceptor } from './noop-interceptor';
import { TrimNameInterceptor } from './trim-name-interceptor';
import { UploadInterceptor } from './upload-interceptor';

/** Array of Http interceptor providers in outside-in order */
export const httpInterceptorProviders = [
  // #enddocregion interceptor-providers
  // #docregion custom-json-interceptor
  { provide: HTTP_INTERCEPTORS, useClass: CustomJsonInterceptor, multi: true },
  { provide: JsonParser, useClass: CustomJsonParser },
  // #enddocregion custom-json-interceptor
  // #docregion interceptor-providers
  { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: EnsureHttpsInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TrimNameInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
];
// #enddocregion interceptor-providers
