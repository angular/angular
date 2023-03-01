import { Component, Optional } from '@angular/core';
import { OptionalService } from '../optional.service';

@Component({
  selector: 'app-optional',
  templateUrl: './optional.component.html',
  styleUrls: ['./optional.component.css']
})

// #docregion optional-component
export class OptionalComponent {
  constructor(@Optional() public optional?: OptionalService) {}
}
// #enddocregion optional-component

// The OptionalService isn't provided here, in the @Injectable()
// providers array, or in the NgModule. If you remove @Optional()
// from the constructor, you'll get an error.



