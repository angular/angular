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
    "ng_for_context_in_attr_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_for_context_in_attr_binding.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
	<div *ngFor="let someElem of someField.someMethod()"
		[attr.someInputAttr]="someElem.someAttr()">
	</div>
`,
    standalone: false
})
export class MyComponent {
  someField!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
