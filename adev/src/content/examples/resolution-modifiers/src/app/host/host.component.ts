import {Component, Host, Optional} from '@angular/core';
import {FlowerService} from '../flower.service';
import {HostChildComponent} from '../host-child/host-child.component';

// #docregion host-component
@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
  //  provide the service
  providers: [{provide: FlowerService, useValue: {emoji: '🌷'}}],
  imports: [HostChildComponent],
})
export class HostComponent {
  // use @Host() in the constructor when injecting the service
  constructor(@Host() @Optional() public flower?: FlowerService) {}
}
// #enddocregion host-component

// if you take out @Host() and the providers array, flower will be red hibiscus
