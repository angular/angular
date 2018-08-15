/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Pipe} from '@angular/core';
import {inject} from '@angular/core/testing';
import {JitReflector} from '@angular/platform-browser-dynamic/src/compiler_reflector';

import {MockPipeResolver} from '../testing';

{
  describe('MockPipeResolver', () => {
    let pipeResolver: MockPipeResolver;

    beforeEach(inject([Injector], (injector: Injector) => {
      pipeResolver = new MockPipeResolver(new JitReflector());
    }));

    describe('Pipe overriding', () => {
      it('should fallback to the default PipeResolver when templates are not overridden', () => {
        const pipe = pipeResolver.resolve(SomePipe);
        expect(pipe.name).toEqual('somePipe');
      });

      it('should allow overriding the @Pipe', () => {
        pipeResolver.setPipe(SomePipe, new Pipe({name: 'someOtherName'}));
        const pipe = pipeResolver.resolve(SomePipe);
        expect(pipe.name).toEqual('someOtherName');
      });
    });
  });
}

@Pipe({name: 'somePipe'})
class SomePipe {
}
