import {Component, OnInit, Host, SkipSelf, Optional} from '@angular/core';
import {AnimalService} from '../animal.service';
import {FlowerService} from '../flower.service';
import {InspectorComponent} from '../inspector/inspector.component';

// #docregion flowerservice
@Component({
  standalone: true,
  selector: 'app-child',
  imports: [InspectorComponent],
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css'],
  // use the providers array to provide a service
  providers: [{provide: FlowerService, useValue: {emoji: '🌻'}}],
})
export class ChildComponent {
  // inject the service
  constructor(
    public flower: FlowerService,
    public animal: AnimalService,
  ) {}
}

// #enddocregion flowerservice
