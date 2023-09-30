import { Injectable, OnDestroy } from '@angular/core';

import { User } from '../user';

/** mock admin users */
const adminUsers = [
  { id: 1, name: 'Maria', isAdmin: true },
  { id: 8, name: 'Pierre', isAdmin: true },
];

// Register service only to the injector of the lazy-loaded routes (see `admin.routes.ts`)
@Injectable()
export class AdminUserService implements OnDestroy {
  constructor() { console.log('AdminUserService instance created.'); } // called when admin route is first activated
  ngOnDestroy() { console.log('AdminUserService instance destroyed.'); } // never called

  getUsers(): Promise<User[]> {
    return Promise.resolve(adminUsers);
  }
}
