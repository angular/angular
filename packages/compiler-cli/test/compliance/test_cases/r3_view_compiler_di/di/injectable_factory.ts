import {Injectable} from '@angular/core';

class MyDependency {}

@Injectable()
export class MyService {
  constructor(dep: MyDependency) {}
}
