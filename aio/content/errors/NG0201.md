@name No Provider Found
@category runtime
@videoUrl https://www.youtube.com/embed/lAlOryf1-WU
@shortDescription No provider for {token} found!

@description
You see this error when you try to inject a service but have not declared a corresponding provider. A provider is a mapping that supplies a value that you can inject into the constructor of a class in your application.

Read more on providers in our [Dependency Injection guide](guide/dependency-injection).

@debugging
Work backwards from the object where the error states that a [provider](guide/architecture-services) is missing: `No provider for ${this}!`. This is commonly thrown in [services](tutorial/toh-pt4), which require non-existing providers.

To fix the error ensure that your service is registered in the list of providers of an `NgModule` or has the `@Injectable` decorator with a `providedIn` property at top.

The most common solution is to add a provider in `@Injectable` using `providedIn`:

```typescript
@Injectable({ providedIn: 'app' })
```
