import {Component} from '@angular/core';
import {FlowerService} from './flower.service';
import {AnimalService} from './animal.service';
import {ChildComponent} from './child/child.component';
import {InspectorComponent} from './inspector/inspector.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ChildComponent, InspectorComponent],
})
// #docregion inject-animal-service
export class AppComponent {
  constructor(
    public flower: FlowerService,
    public animal: AnimalService,
  ) {}
}
// #enddocregion inject-animal-service

// When using @Host() together with @SkipSelf() in
// child.component.ts for the AnimalService, add the
// following viewProviders array to the @Component metadata:

// viewProviders: [{ provide: AnimalService, useValue: { emoji: '🦔' } }]

// So, the entire ChildComponent @Component() decorator and its
// metadata should be as follows:

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: [ './app.component.css' ],
//   viewProviders: [{ provide: AnimalService, useValue: { emoji: '🦔' } }]
// })
