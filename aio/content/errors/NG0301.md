@name Export Not Found
@category runtime
@videoUrl https://www.youtube.com/embed/fUSAg4kp2WQ
@shortDescription Export not found!

@description
Angular can’t find a directive with `{{ PLACEHOLDER }}` export name. The export name is specified in the `exportAs` property of the directive decorator. This is common when using FormsModule or Material modules in templates, and you’ve forgotten to [import the corresponding modules](guide/sharing-ngmodules).

<div class="alert is-helpful">

This is the runtime equivalent of a common compiler error [NG8003: No directive found with export](errors/NG8003).

</div>

@debugging
Use the export name to trace the templates or modules using this export.

Ensure that all dependencies are [properly imported and declared in your NgModules](guide/sharing-ngmodules). For example, if the export not found is `ngForm`, we need to import `FormsModule` and declare it in the list of imports in `*.module.ts` to resolve the error.

```typescript
import { FormsModule } from '@angular/forms';

@NgModule({
  ...
  imports: [
    FormsModule,
    …
```

If you recently added an import, you may need to restart your server to see these changes.


