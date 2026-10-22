import {Service} from '@angular/core';
import {Observable, of, delay} from 'rxjs';

const ROLES = ['Hamlet', 'Ophelia', 'Romeo', 'Juliet'];

@Service()
export class ActorsService {
  isRoleTaken(role: string): Observable<boolean> {
    const isTaken = ROLES.includes(role);

    return of(isTaken).pipe(delay(400));
  }
}
