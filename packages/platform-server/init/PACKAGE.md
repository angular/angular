Initializes the server environment for rendering an Angular application.

For example, it provides shims (such as DOM globals) for the server environment.

The initialization happens as a [side effect of importing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#import_a_module_for_its_side_effects_only) the entry point (i.e. there are no specific exports):

```ts
import '@angular/platform-server/init';
```

<div class="alert is-important">

  The import must come before any imports (direct or transitive) that rely on DOM built-ins being available.

</div>
