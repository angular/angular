import { Directive, forwardRef, Injectable } from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  NG_ASYNC_VALIDATORS,
  ValidationErrors
} from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { HeroesService } from './heroes.service';
import { Observable, of } from 'rxjs';

// #docregion async-validator
@Injectable({ providedIn: 'root' })
export class UniqueAlterEgoValidator implements AsyncValidator {
  constructor(private heroesService: HeroesService) {}

  validate(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.heroesService.isAlterEgoTaken(control.value).pipe(
      map(isTaken => (isTaken ? { uniqueAlterEgo: true } : null)),
      catchError(() => of(null))
    );
  }
}
// #enddocregion async-validator

// #docregion async-validator-directive
@Directive({
  selector: '[appUniqueAlterEgo]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => UniqueAlterEgoValidatorDirective),
      multi: true
    }
  ]
})
export class UniqueAlterEgoValidatorDirective implements AsyncValidator {
  constructor(private validator: UniqueAlterEgoValidator) {}

  validate(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.validator.validate(control);
  }
}
// #enddocregion async-validator-directive
