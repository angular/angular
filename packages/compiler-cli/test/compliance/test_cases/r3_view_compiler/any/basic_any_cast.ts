import {Component} from '@angular/core';

@Component({template: '<div [tabIndex]="$any(10)"></div>'})
class Comp {
}
