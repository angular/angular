# Migration to Control Flow syntax

[Control flow syntax](guide/templates/control-flow) is available from Angular v17. The new syntax is baked into the template, so you don't need to import `CommonModule` anymore.

This schematic migrates all existing code in your application to use new Control Flow Syntax.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:control-flow

</docs-code>

#### NgIf

<docs-code-multifile>
  <docs-code
    header="before"
    >
<div *ngIf="show">Content</div>
<div *ngIf="condition; else elseTemplate">Content</div>
<ng-template #elseTemplate>Else content</ng-template>
    </docs-code>
  <docs-code
    header="after"
    >
@if (show) {
  <div>Content</div>
}
@if (condition) {
  <div>Content</div>
} @else {
  Else content
}
    </docs-code>
</docs-code-multifile>

#### NgFor

<docs-code-multifile>
  <docs-code
    header="before"
    >
<li *ngFor="let item of items; trackBy: trackFn; let i = index">
  {{item.name}} - {{i}}
</li>
    </docs-code>
  <docs-code
    header="after"
    >
@for (item of items; track trackFn($index, item)) {
  <li>{{item.name}} - {{$index}}</li>
}
    </docs-code>
</docs-code-multifile>

#### NgSwitch

<docs-code-multifile>
  <docs-code
    header="before"
    >
<div [ngSwitch]="value">
  <p *ngSwitchCase="1">Case 1</p>
  <p *ngSwitchCase="2">Case 2</p>
  <p *ngSwitchDefault>Default</p>
</div>
    </docs-code>
  <docs-code
    header="after"
    >
@switch (value) {
  @case (1) {
    <p>Case 1</p>
  }
  @case (2) {
    <p>Case 2</p>
  }
  @default {
    <p>Default</p>
  }
}
    </docs-code>
</docs-code-multifile>

## Configuration Parameters

The migration supports a few options for fine tuning the migration to your specific needs.

### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

### `--format`

Whether to format the migrated templates
