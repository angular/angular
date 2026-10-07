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
    "i18n_after_binding.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /i18n_after_binding.ts
```ts
import {Component, Input, NgModule} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: `
		<span i18n>
  			<input [disabled]="someBoolean">
			{{ someField }}
		</span>
	`,
})
export class MyComponent {
  someBoolean = false;
  someField!: any;
}
```
