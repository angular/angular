# Export Not Found

<docs-video src="https://www.youtube.com/embed/fUSAg4kp2WQ"/>

Angular can't find a directive with `{{ PLACEHOLDER }}` export name. The export name is specified in the `exportAs` property of the directive decorator. This is common when using FormsModule or Material modules in templates and you've forgotten to import the corresponding modules.

HELPFUL: This is the runtime equivalent of a common compiler error [NG8003: No directive found with export](errors/NG8003).

## Debugging the error

Use the export name to trace the templates or modules using this export.

Ensure that all dependencies are properly imported and declared in your NgModules. For example, if the export not found is `ngForm`, we need to import `FormsModule` and declare it in the list of imports in `*.module.ts` to resolve the error.

<docs-code language="typescript">

import { FormsModule } from '@angular/forms';

@NgModule({
  …
  imports: [
    FormsModule,
    …

</docs-code>

If you recently added an import, you may need to restart your server to see these changes.
