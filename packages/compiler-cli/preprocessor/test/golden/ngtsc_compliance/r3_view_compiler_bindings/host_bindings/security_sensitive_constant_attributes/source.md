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
    "security_sensitive_constant_attributes.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /security_sensitive_constant_attributes.ts
```ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {'src': 'trusted', 'srcdoc': 'trusted'},
})
export class HostBindingDir {
}

@Directive({
  selector: 'img',
  host: {'src': 'trusted', 'srcdoc': 'trusted'},
})
export class HostBindingDir2 {
}
```
