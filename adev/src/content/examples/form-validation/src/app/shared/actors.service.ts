import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

const ROLES = ['Hamlet', 'Ophelia', 'Romeo', 'Juliet'];

@Injectable({providedIn: 'root'})
export class ActorsService {
  isRoleTaken(role: string): Observable<boolean> {
    const isTaken = ROLES.includes(role);

    return of(isTaken).pipe(delay(400));
  }
}
