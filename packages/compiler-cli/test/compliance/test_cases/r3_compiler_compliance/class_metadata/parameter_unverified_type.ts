import {Injectable, Optional} from '@angular/core';
import {SomeService} from './external';

export class LocalService {}

@Injectable()
export class ParameterizedInjectable {
  constructor(
    local: LocalService,
    external: SomeService,
    @Optional() optionalExternal: SomeService,
  ) {}
}
