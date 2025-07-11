export const ifElseReferenceTemplate = `<div *ngIf="isLoggedIn; else loggedOut">
  Welcome back, friend.
</div>

<ng-template #loggedOut>
  Please friend, login.
</ng-template>`;
