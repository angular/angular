# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "attr_binding_on_structural_inside_ng_template.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /attr_binding_on_structural_inside_ng_template.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
	<ng-template #someLocalRef>
		<span [attr.someAttr]="someField" *ngIf="someBooleanField"></span>
	</ng-template>
`,
    standalone: false
})
export class MyComponent {
  someField!: any;
  someBooleanField!: boolean;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
