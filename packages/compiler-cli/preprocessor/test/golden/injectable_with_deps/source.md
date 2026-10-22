# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["data.service.ts", "logger.service.ts", "url_handling_strategy.ts", "custom_factory.service.ts"]
}
```

# /logger.service.ts
```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(msg: string) { console.log(msg); }
}
```

# /data.service.ts
```ts
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private logger: LoggerService) {}
}
```

# /url_handling_strategy.ts
```ts
import {Injectable, inject} from '@angular/core';

@Injectable({providedIn: 'root', useFactory: () => inject(DefaultUrlHandlingStrategy)})
export abstract class UrlHandlingStrategy {}

@Injectable({providedIn: 'root'})
export class DefaultUrlHandlingStrategy {}
```

# /custom_factory.service.ts
```ts
import { Injectable, Optional } from '@angular/core';

export class Dep {}

export function factory(dep: Dep) {
  return new CustomService(dep);
}

@Injectable({
  providedIn: 'root',
  useFactory: factory,
  deps: [[new Optional(), Dep], [new Host(), Dep]],
})
export class CustomService {
  constructor(public dep: Dep) {}
}
```
