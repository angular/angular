/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, it, inject,} from '@angular/core/testing/testing_internal';

import {stringify, isBlank} from '../src/facade/lang';
import {MockPipeResolver} from '../testing';
import {Pipe, PipeMetadata, Injector} from '@angular/core';

export function main() {
  describe('MockPipeResolver', () => {
    var pipeResolver: MockPipeResolver;

    beforeEach(inject(
        [Injector], (injector: Injector) => { pipeResolver = new MockPipeResolver(injector); }));

    describe('Pipe overriding', () => {
      it('should fallback to the default PipeResolver when templates are not overridden', () => {
        var pipe = pipeResolver.resolve(SomePipe);
        expect(pipe.name).toEqual('somePipe');
      });

      it('should allow overriding the @Pipe', () => {
        pipeResolver.setPipe(SomePipe, new PipeMetadata({name: 'someOtherName'}));
        var pipe = pipeResolver.resolve(SomePipe);
        expect(pipe.name).toEqual('someOtherName');
      });
    });
  });
}

@Pipe({name: 'somePipe'})
class SomePipe {
}
