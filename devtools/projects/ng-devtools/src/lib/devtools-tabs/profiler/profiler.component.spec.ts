/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';

import {Events, MessageBus} from '../../../../../protocol';
import {FileApiService} from './file-api-service';
import {ProfilerComponent} from './profiler.component';

class MessageBusMock implements MessageBus<Events> {
  readonly emit = jasmine.createSpy('emit');
  readonly once = jasmine.createSpy('once');
  readonly destroy = jasmine.createSpy('destroy');
  private listeners = new Map<keyof Events, Set<Function>>();

  on = jasmine.createSpy('on').and.callFake((topic: keyof Events, cb: Function) => {
    let topicCbs = this.listeners.get(topic);
    if (!topicCbs) {
      topicCbs = new Set();
      this.listeners.set(topic, topicCbs);
    }
    topicCbs.add(cb);
    return () => topicCbs.delete(cb);
  });

  hasListener(topic: keyof Events): boolean {
    return (this.listeners.get(topic)?.size ?? 0) > 0;
  }
}

describe('ProfilerComponent', () => {
  let messageBus: MessageBusMock;
  let dialog: jasmine.SpyObj<MatDialog>;
  let fixture: ComponentFixture<ProfilerComponent>;

  beforeEach(async () => {
    messageBus = new MessageBusMock();
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    TestBed.configureTestingModule({
      imports: [ProfilerComponent],
      providers: [
        {provide: MessageBus, useValue: messageBus},
        {provide: MatDialog, useValue: dialog},
      ],
    });

    fixture = TestBed.createComponent(ProfilerComponent);
    await fixture.whenStable();
  });

  it('should unregister the profiler message bus listeners on destroy', () => {
    expect(messageBus.hasListener('profilerResults')).toBeTrue();
    expect(messageBus.hasListener('sendProfilerChunk')).toBeTrue();

    fixture.destroy();

    expect(messageBus.hasListener('profilerResults')).toBeFalse();
    expect(messageBus.hasListener('sendProfilerChunk')).toBeFalse();
  });

  it('should stop handling uploaded files once destroyed', () => {
    const fileApiService = TestBed.inject(FileApiService);

    fileApiService.uploadedData.next({error: new Error('Invalid file')});
    expect(dialog.open).toHaveBeenCalledTimes(1);

    fixture.destroy();
    fileApiService.uploadedData.next({error: new Error('Invalid file')});

    expect(dialog.open).toHaveBeenCalledTimes(1);
  });
});
