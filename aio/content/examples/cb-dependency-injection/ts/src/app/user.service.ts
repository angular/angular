// #docregion
import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

  getUserById(userId: number): any {
    return {name: 'Bombasto', role: 'Admin'};
  }
}
