import {Component} from '@angular/core';

@Component({template: '<div [tabIndex]="this.$any(null)"></div>'})
class Comp {
  $any(value: null): any {
    return value as any;
  }
}
