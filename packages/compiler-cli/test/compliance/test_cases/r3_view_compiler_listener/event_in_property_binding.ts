import {Component} from '@angular/core';

@Component({template: '<div [event]="$event"></div>'})
class Comp {
  $event = 1;
}
