/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, beforeEachProviders, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {ON_WEB_WORKER} from '@angular/platform-webworker/src/web_workers/shared/api';
import {RenderStore} from '@angular/platform-webworker/src/web_workers/shared/render_store';
import {PRIMITIVE, Serializer} from '@angular/platform-webworker/src/web_workers/shared/serializer';
import {ServiceMessageBroker_} from '@angular/platform-webworker/src/web_workers/shared/service_message_broker';


import {createPairedMessageBuses} from './web_worker_test_util';

export function main() {
  const CHANNEL = 'UIMessageBroker Test Channel';
  const TEST_METHOD = 'TEST_METHOD';
  const PASSED_ARG_1 = 5;
  const PASSED_ARG_2 = 'TEST';
  const RESULT = 20;
  const ID = 'methodId';

  beforeEachProviders(() => [Serializer, {provide: ON_WEB_WORKER, useValue: true}, RenderStore]);

  describe('UIMessageBroker', () => {
    var messageBuses: any /** TODO #9100 */;

    beforeEach(() => {
      messageBuses = createPairedMessageBuses();
      messageBuses.ui.initChannel(CHANNEL);
      messageBuses.worker.initChannel(CHANNEL);
    });
    it('should call registered method with correct arguments',
       inject([Serializer], (serializer: Serializer) => {
         var broker = new ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
         broker.registerMethod(TEST_METHOD, [PRIMITIVE, PRIMITIVE], (arg1, arg2) => {
           expect(arg1).toEqual(PASSED_ARG_1);
           expect(arg2).toEqual(PASSED_ARG_2);
         });
         messageBuses.worker.to(CHANNEL).emit(
             {'method': TEST_METHOD, 'args': [PASSED_ARG_1, PASSED_ARG_2]});
       }));

    it('should return promises to the worker', inject([Serializer], (serializer: Serializer) => {
         var broker = new ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
         broker.registerMethod(TEST_METHOD, [PRIMITIVE], (arg1) => {
           expect(arg1).toEqual(PASSED_ARG_1);
           return new Promise((res, rej) => {
             try {
               res(RESULT);
             } catch (e) {
               rej(e);
             }
           });
         });
         messageBuses.worker.to(CHANNEL).emit(
             {'method': TEST_METHOD, 'id': ID, 'args': [PASSED_ARG_1]});
         messageBuses.worker.from(CHANNEL).subscribe({
           next: (data: any) => {
             expect(data.type).toEqual('result');
             expect(data.id).toEqual(ID);
             expect(data.value).toEqual(RESULT);
           },
         });
       }));
  });
}
