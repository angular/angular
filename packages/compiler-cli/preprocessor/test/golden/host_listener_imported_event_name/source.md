# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["events.ts", "dir.ts"]
}
```

# /events.ts
```ts
export const CUSTOM_CLICK_EVENT = 'customClick';
export const TARGET = 'window';
```

# /dir.ts
```ts
import { Directive, HostListener } from '@angular/core';
import { CUSTOM_CLICK_EVENT, TARGET } from './events';

const LOCAL_EVENT = 'focus';

@Directive({ selector: '[myDir]' })
export class MyDir {
  @HostListener(CUSTOM_CLICK_EVENT, ['$event'])
  handleClick(e: Event) {}

  @HostListener(`${TARGET}:resize`)
  onResize() {}

  @HostListener(LOCAL_EVENT)
  onFocus() {}
}
```
