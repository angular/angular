import {Injectable, Optional} from '@angular/core';

class MyDependency {}
class MyOptionalDependency {}

@Injectable()
export class MyService {
  constructor(dep: MyDependency);
  constructor(dep: MyDependency, @Optional() optionalDep?: MyOptionalDependency) {}
}
