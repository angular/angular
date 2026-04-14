import {Service} from '@angular/core';

@Service()
export class MyService<T extends number, V = T> {
  getOne(): T {
    return null!;
  }

  getTwo(): V {
    return null!;
  }
}
