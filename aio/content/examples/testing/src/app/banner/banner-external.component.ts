// #docplaster
// #docregion
import { Component } from '@angular/core';

// #docregion metadata
@Component({
  selector: 'app-banner',
  templateUrl: './banner-external.component.html',
  styleUrls:  ['./banner-external.component.css']
})
// #enddocregion metadata
export class BannerComponent {
  title = 'Test Tour of Heroes';
}
