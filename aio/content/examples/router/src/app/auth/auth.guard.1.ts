// #docregion
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  console.log('authGuard#canActivate called');
  return true;
};
// #enddocregion
