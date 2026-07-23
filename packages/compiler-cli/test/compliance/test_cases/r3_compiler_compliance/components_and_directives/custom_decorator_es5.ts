import {Component, InjectionToken} from '@angular/core';

const token = new InjectionToken('token');

export function Custom() {
  return function(target: any) {};
}

@Custom()
@Component({
    template: '',
    providers: [{ provide: token, useExisting: Comp }],
})
export class Comp {
}
