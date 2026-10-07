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
    "host_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_bindings.ts
```ts
import {Component, HostBinding} from '@angular/core';

@Component({
    template: '',
    host: {
        '[class.apple]': 'yesToApple',
        '[style.color]': 'color',
        '[class.tomato]': 'yesToTomato',
        '[style.transition]': 'transition'
    },
    standalone: false
})
export class MyComponent {
  color = 'red';
  transition = 'all 1337ms ease';
  yesToApple = true;
  yesToTomato = false;

  @HostBinding('style.border') border = '1px solid purple';

  @HostBinding('class.orange') yesToOrange = true;
}
```
