import {Directive, forwardRef, Injectable} from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import {catchError, map} from 'rxjs/operators';
import {ActorsService} from './actors.service';
import {Observable, of} from 'rxjs';

// #docregion async-validator
@Injectable({providedIn: 'root'})
export class UniqueRoleValidator implements AsyncValidator {
  constructor(private actorsService: ActorsService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.actorsService.isRoleTaken(control.value).pipe(
      map((isTaken) => (isTaken ? {uniqueRole: true} : null)),
      catchError(() => of(null)),
    );
  }
}
// #enddocregion async-validator

// #docregion async-validator-directive
@Directive({
  selector: '[appUniqueRole]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => UniqueRoleValidatorDirective),
      multi: true,
    },
  ],
  standalone: false,
})
export class UniqueRoleValidatorDirective implements AsyncValidator {
  constructor(private validator: UniqueRoleValidator) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.validator.validate(control);
  }
}
// #enddocregion async-validator-directive
