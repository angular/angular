// #docregion
import { Component }  from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Villain, VillainsService } from './villains.service';

// #docregion metadata
@Component({
  moduleId: module.id,
  selector: 'villains-list',
  templateUrl: './villains-list.component.html',
  providers: [ VillainsService ]
})
// #enddocregion metadata
export class VillainsListComponent {
  villaines: Observable<Villain[]>;

  constructor(private villainesService: VillainsService) {
    this.villaines = villainesService.getVillains();
  }
}
