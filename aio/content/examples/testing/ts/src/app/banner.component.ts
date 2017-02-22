// #docregion
import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls:  ['./banner.component.css']
})
export class BannerComponent {
  title = 'Test Tour of Heroes';
}

