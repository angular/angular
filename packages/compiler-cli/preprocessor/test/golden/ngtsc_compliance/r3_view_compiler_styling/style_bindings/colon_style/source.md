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
    "colon_style.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /colon_style.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
		<div style=":root {color: red;}"></div>
	`
})
export class MyComponent {
}
```
