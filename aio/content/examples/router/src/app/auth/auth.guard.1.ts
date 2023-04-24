// #docregion

export const authGuard = () => {
  console.log('authGuard#canActivate called');
  return true;
};
// #enddocregion
