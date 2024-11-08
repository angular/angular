import {Component} from '@angular/core';

@Component({
    template: '{{this.globalThis.Math.random()}}',
})
class Comp {
  globalThis = globalThis;
}
