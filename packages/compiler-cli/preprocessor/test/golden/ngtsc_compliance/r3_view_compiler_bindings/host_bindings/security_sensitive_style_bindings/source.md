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
    "security_sensitive_style_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /security_sensitive_style_bindings.ts
```ts
import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {'[style.background-image]': 'imgUrl', '[style]': 'styles'},
})
export class HostBindingDir {
  imgUrl = 'url(foo.jpg)';
  styles = {backgroundImage: this.imgUrl};
}
```
