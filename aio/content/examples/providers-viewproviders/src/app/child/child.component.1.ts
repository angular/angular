import { Component, OnInit, Host, SkipSelf, Optional } from '@angular/core';
import { FlowerService } from '../flower.service';

// #docregion flowerservice
@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css'],
  // use the providers array to provide a service
  providers: [{ provide: FlowerService, useValue: { emoji: '🌻' } }]
})

export class ChildComponent {
  // inject the service
  constructor( public flower: FlowerService) { }
}

// #enddocregion flowerservice

