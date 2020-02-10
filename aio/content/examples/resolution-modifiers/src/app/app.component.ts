import { Component } from '@angular/core';
import { LeafService } from './leaf.service';
import { FlowerService } from './flower.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  name = 'Angular';
  constructor(public flower: FlowerService, public leaf: LeafService) {}
}
