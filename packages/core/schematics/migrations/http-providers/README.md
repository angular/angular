## Replace Http modules from `@angular/common/http` with provider functions 

`HttpClientModule`, `HttpClientXsrfModule`, `HttpClientJsonpModule` are deprecated in favor of `provideHttpClient` and its options. 
`HttpClientTestingModule` is deprecated in favor or `provideHttpClientTesting()`

This migration updates any `@NgModule`, `@Component`, `@Directive` that imports those modules.

### Http Modules

#### Before
```ts

import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule } from '@angular/common/http';

@NgModule({
    imports: [CommonModule, HttpClientModule,HttpClientJsonpModule, HttpClientXsrfModule)],
})
export class AppModule {}
```

#### After
```ts
import { provideHttpClient, withJsonpSupport, withXsrfConfiguration } from '@angular/common/http';

@NgModule({
    imports: [CommonModule],
    providers: [provideHttpClient(withJsonpSupport(), withXsrfConfiguration())]
})
export class AppModule {}
```

### Testing

#### Before 

```
import { HttpClientTestingModule } from '@not-angular/common/http/testing';

describe('some test') {

    it('...', () => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
    })
}
```

#### Before

```
import { provideHttpClientTesting } from '@not-angular/common/http/testing';

describe('some test') {

    it('...', () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting()],
      });
    })
}
```
