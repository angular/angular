import { Component } from '@angular/core';
import { FlowerService } from '../flower.service';
import { AnimalService } from '../animal.service';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
// #docregion injection
export class InspectorComponent {
  constructor(public flower: FlowerService, public animal: AnimalService) { }
}
// #enddocregion injection
