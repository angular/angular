import { Component } from '@angular/core';
import { FlowerService } from './flower.service';
import { AnimalService } from './animal.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
// #docregion inject-animal-service
export class AppComponent  {
  constructor(public flower: FlowerService, public animal: AnimalService) {}
}
// #enddocregion inject-animal-service
