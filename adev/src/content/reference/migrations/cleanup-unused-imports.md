# Clean up unused imports

As of version 19, Angular reports when a component's `imports` array contains symbols that aren't used in its template.

Running this schematic will clean up all unused imports within the project.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:cleanup-unused-imports

</docs-code>

#### Before

<docs-code language="typescript">
import { Component } from '@angular/core';
import { UnusedDirective } from './unused';

@Component({
  template: 'Hello',
  imports: [UnusedDirective],
})
export class MyComp {}
</docs-code>

#### After

<docs-code language="typescript">
import { Component } from '@angular/core';

@Component({
  template: 'Hello',
  imports: [],
})
export class MyComp {}
</docs-code>
