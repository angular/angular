/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {ALLOWED_COMMAND_PREFIXES, CommandValidator} from './command-validator.service';

describe('CommandValidator', () => {
  let service: CommandValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true when user try to execute allowed commands', () => {
    for (const command of ALLOWED_COMMAND_PREFIXES) {
      const result = service.validate(`${command} other command params`);
      expect(result).toBeTrue();
    }
  });

  it('should return false when user try to execute illegal commands', () => {
    const result = service.validate(`npm install`);
    expect(result).toBeFalse();
  });
});
