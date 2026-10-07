# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "app/*": ["src/*"]
    },
    "ignoreDeprecations": "6.0"
  },
  "files": [
    "src/components/container.ts"
  ]
}
```

# /src/components/container.ts
```ts
import { Component, HostListener } from '@angular/core';

export const MIN_LARGE_SCREEN_WIDTH = 1000;

@Component({
  standalone: true,
  selector: 'app-container',
  template: '<div>Container</div>',
})
export class ContainerComponent {
  @HostListener('window:resize', [`$event.target.innerWidth < ${MIN_LARGE_SCREEN_WIDTH}`])
  onResize(isSmallScreen: boolean): void {}
}
```
