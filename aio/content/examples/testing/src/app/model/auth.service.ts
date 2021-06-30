/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MockTokenService {
  // Simulate get auth token from some remote service.
  async getToken(user: string): Promise<string> {
    return new Promise(res => {
      setTimeout(() => res(`${user} token`));
    });
  }
}

@Injectable()
export class AuthService {
  userToken$ = new BehaviorSubject('');
  tokenInterval;

  constructor(private tokenService: MockTokenService) {}

  // Simulate refresh token with setInterval
  auth(user: string) {
    this.tokenInterval = setInterval(async () => {
      const token = await this.tokenService.getToken(user);
      this.userToken$.next(token);
    }, 1000);
  }

  logout(user: string) {
    // Clear the setInterval to finish the refresh token process.
    clearInterval(this.tokenInterval);
    this.userToken$.next(undefined);
  }
}
