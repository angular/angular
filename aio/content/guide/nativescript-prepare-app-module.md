# Prepare NativeScript AppModule

Before you start converting all components to NativeScript, you need to make sure that the NativeScript AppModule (`app.module.tns.ts`) imports all the required modules, which are used by the services in the project.

When you check `cart.service.ts` you will find that it Injects the **HttpClient**:

```typescript
  constructor(
    private http: HttpClient
  ) {}
```

In the web version of the AppModule, **HttpClient** is imported via **HttpClientModule**.

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    ...
  ],
```

NativeScript provides a mobile-specific implementation of the **HttpClient**, which is provided via **NativeScriptHttpClientModule**. 

Open `app.module.tns.ts` where you will find a commented import for **NativeScriptHttpClientModule** class (*line 13*). Uncomment it, and add **NativeScriptHttpClientModule** to @NgModule **imports**, like this:

```typescript
import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';

@NgModule({
  ...
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    NativeScriptHttpClientModule
  ],
```

This is enough to make the **CartService** work for both Web and Mobile, without any change required to the service itself.

## Example

Here is a high-level visualisation of how the correct implementation of the **HttpClient** is provided to the service at build time.

<img src="generated/images/guide/nativescript/2-http-client.png" width="100%">


## Next steps

Next, you need to convert each component into a code-sharing component, by providing the UI implementation for each template.

For step-by-step instructions, see [Migrate Components](guide/nativescript-migrate-components).
