# Bootstrapped NgModule doesn't specify which component to initialize

This error means that an NgModule that was used for bootstrapping an application is missing key information for Angular to proceed with the bootstrap process.

The error happens when the NgModule `bootstrap` property is missing (or is an empty array) in the `@NgModule` annotation and there is no `ngDoBootstrap` lifecycle hook defined on that NgModule class.

More information about the bootstrapping process can be found in [this guide](guide/ngmodules/bootstrapping).

The following examples will trigger the error.

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
})
export class AppModule {}

// The `AppModule` is used for bootstrapping, but the `@NgModule.bootstrap` field is missing.
platformBrowser().bootstrapModule(AppModule);
```

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [],
})
export class AppModule {}

// The `AppModule` is used for bootstrapping, but the `@NgModule.bootstrap` field contains an empty array.
platformBrowser().bootstrapModule(AppModule);
```

## Debugging the error

Please make sure that the NgModule that is used for bootstrapping is set up correctly:

- either the `bootstrap` property exists (and contains a non-empty array) in the `@NgModule` annotation
- or the `ngDoBootstrap` method exists on the NgModule class
