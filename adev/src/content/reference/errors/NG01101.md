# Wrong Async Validator Return Type

Async validators must return a promise or an observable, and emit/resolve them whether the validation fails or succeeds. In particular, they must implement the [AsyncValidatorFn API](api/forms/AsyncValidator)

```typescript
export function isTenAsync(control: AbstractControl): 
  Observable<ValidationErrors | null> {
    const v: number = control.value;
    if (v !== 10) {
    // Emit an object with a validation error.
      return of({ 'notTen': true, 'requiredValue': 10 });
    }
    // Emit null, to indicate no error occurred.
    return of(null);
  }
```

## Debugging the error

Did you mistakenly use a synchronous validator instead of an async validator?
