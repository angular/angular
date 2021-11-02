@name Missing Reference Target
@category compiler
@videoUrl https://www.youtube.com/embed/fUSAg4kp2WQ
@shortDescription No directive found with export

@description
Angular can’t find a directive with `{{ PLACEHOLDER }}` export name. This is common with a missing import or a missing [`exportAs`](api/core/Directive#exportAs) on a directive.


<div class="alert is-helpful">

This is the compiler equivalent of a common runtime error [NG0301: Export Not Found](errors/NG0301).

</div>

@debugging
Use the string name of the export not found to trace the templates or modules using this export.

Ensure that all dependencies are properly imported and declared in our Modules. For example, if the export not found is `ngForm`, we will need to import `FormsModule` and declare it in our list of imports in `*.module.ts` to resolve the missing export error.

```typescript
import { FormsModule } from '@angular/forms';

@NgModule({
  ...
  imports: [
    FormsModule,
    …
```

If you recently added an import, you will need to restart your server to see these changes.
