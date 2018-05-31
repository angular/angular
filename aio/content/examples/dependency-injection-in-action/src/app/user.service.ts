// #docregion
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getUserById(userId: number): any {
    return {name: 'Bombasto', role: 'Admin'};
  }
}
