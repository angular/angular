import {Component} from '@angular/core';
import {FlowerService} from './flower.service';
import {AnimalService} from './animal.service';
import {InspectorComponent} from './inspector/inspector.component';
import {ChildComponent} from './child/child.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [InspectorComponent, ChildComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
// #docregion injection
export class AppComponent {
  constructor(
    public flower: FlowerService,
    public animal: AnimalService,
  ) {}
}
// #enddocregion injection
