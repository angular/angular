import { Injectable } from '@angular/core';

import { of }         from 'rxjs/observable/of';

export interface Villain { id: number; name: string; }

@Injectable()
export class VillainsService {
 villains: Villain[] = [
    { id: 1, name: 'Dr. Evil'},
    { id: 2, name: 'Moriarty'}
  ];

  getVillains() {
    return of(this.villains);
  }
}
