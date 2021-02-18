/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {patchMethod} from '../common/utils';

export function patchMacroTaskWithEvent(
    name: string, target: any, scheduleMethods: string[], abortMethod: string,
    loadedEventName: string) {
  const addEventListener =
      target[Zone.__symbol__('addEventListener')] || target['addEventListener'];
  const removeEventListener =
      target[Zone.__symbol__('removeEventListener')] || target['removeEventListener'];
  const abortNative =
      patchMethod(target, abortMethod, (delegate: Function) => (self: any, args: any[]) => {
        const task: Task = self[Zone.__symbol__(`${name}Task`)];
        if (!task) {
          return delegate.apply(self, args);
        }
        return task.zone.cancelTask(task);
      });
  scheduleMethods.forEach(m => {
    patchMethod(target, m, (delegate: Function) => (self: any, args: any[]) => {
      Zone.current.scheduleMacroTask(
          `${name}.${m}`, () => {}, self,
          (task: Task) => {
            self[Zone.__symbol__(`${name}Task`)] = task;
            const oldListener = self[Zone.__symbol__(`${name}Listener`)];
            oldListener && removeEventListener.call(self, loadedEventName, oldListener);
            const newListener = function() {
              removeEventListener.call(self, loadedEventName, newListener);
              task.invoke();
            };
            addEventListener.call(self, loadedEventName, newListener);
            return delegate.apply(self, args);
          },
          () => {
            return abortNative!.call(self);
          });
    });
  });
}
