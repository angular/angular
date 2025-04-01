# Root element was not found

Bootstrapped components are defined in the `bootstrap` property of an `@NgModule` decorator or as the first parameter of `bootstrapApplication` for standalone components.

This error happens when Angular tries to bootstrap one of these components but cannot find its corresponding node in the DOM.

## Debugging the error

This issue occurs when the selector mismatches the tag

```typescript
@Component({
  selector: 'my-app',
  ...
})
class AppComponent {}
```

```angular-html
<html>
    <app-root></app-root> <!-- Doesn't match the selector -->
</html>
```

Replace the tag with the correct one:

```angular-html
<html>
    <my-app></my-app> <!-- OK -->
</html>
```
