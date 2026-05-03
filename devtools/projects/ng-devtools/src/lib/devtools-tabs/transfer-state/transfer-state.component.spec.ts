/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Clipboard} from '@angular/cdk/clipboard';

import {Events, MessageBus, TransferStateValue} from '../../../../../protocol';
import {LOADING_TIMEOUT, TransferStateComponent} from './transfer-state.component';

type DataCallback = (data: Record<string, TransferStateValue> | null) => void;

class MessageBusMock implements Pick<MessageBus<Events>, 'on' | 'emit' | 'once' | 'destroy'> {
  readonly emit = jasmine.createSpy('emit');
  readonly once = jasmine.createSpy('once');
  readonly destroy = jasmine.createSpy('destroy');
  private listeners = new Map<keyof Events, Set<Function>>();

  on = jasmine.createSpy('on').and.callFake((topic: keyof Events, cb: Function) => {
    if (!this.listeners.has(topic)) this.listeners.set(topic, new Set());
    this.listeners.get(topic)!.add(cb);
    return () => this.listeners.get(topic)!.delete(cb);
  });

  emitToListener(topic: keyof Events, ...args: unknown[]): void {
    this.listeners.get(topic)?.forEach((cb) => cb(...args));
  }

  hasListener(topic: keyof Events): boolean {
    return (this.listeners.get(topic)?.size ?? 0) > 0;
  }
}

describe('TransferStateComponent', () => {
  let messageBus: MessageBusMock;
  let clipboardSpy: jasmine.SpyObj<Clipboard>;
  let fixture: ComponentFixture<TransferStateComponent>;
  let component: TransferStateComponent;
  let timeoutCallback: Function | null;
  let originalSetTimeout: typeof window.setTimeout;

  async function createComponent(): Promise<void> {
    fixture = TestBed.createComponent(TransferStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  async function emitData(data: Record<string, TransferStateValue> | null): Promise<void> {
    messageBus.emitToListener('transferStateData', data);
    await fixture.whenStable();
  }

  beforeEach(() => {
    messageBus = new MessageBusMock();
    clipboardSpy = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);

    timeoutCallback = null;
    originalSetTimeout = window.setTimeout;
    spyOn(window, 'setTimeout').and.callFake(((fn: Function, ms?: number) => {
      // Only capture the component's loading timeout; let other setTimeouts pass through.
      if (ms === LOADING_TIMEOUT) {
        timeoutCallback = fn;
        return 0;
      }
      return originalSetTimeout(fn as () => void, ms);
    }) as typeof window.setTimeout);

    TestBed.configureTestingModule({
      imports: [TransferStateComponent],
      providers: [
        {provide: MessageBus, useValue: messageBus},
        {provide: Clipboard, useValue: clipboardSpy},
      ],
    });
  });

  afterEach(() => {
    window.setTimeout = originalSetTimeout;
  });

  it('creates the component and emits getTransferState on init', async () => {
    await createComponent();
    expect(component).toBeTruthy();
    expect(messageBus.emit).toHaveBeenCalledWith('getTransferState');
    expect(messageBus.hasListener('transferStateData')).toBe(true);
  });

  it('starts in the loading state until data arrives', async () => {
    await createComponent();
    expect(component.isLoading()).toBe(true);
    await emitData({});
    expect(component.isLoading()).toBe(false);
  });

  it('treats backend null as empty (educational state)', async () => {
    await createComponent();
    await emitData(null);
    expect(component.isLoading()).toBe(false);
    expect(component.hasData()).toBe(false);
    expect(component.transferStateData()).toEqual({});
  });

  it('renders the table when data has entries', async () => {
    await createComponent();
    await emitData({greeting: 'hello', count: 3});
    expect(component.hasData()).toBe(true);
    expect(component.transferStateItems().length).toBe(2);
  });

  it('computes UTF-8 byte size of the serialized entry', async () => {
    await createComponent();
    await emitData({greeting: 'héllo'});
    const item = component.transferStateItems()[0];
    expect(item.bytes).toBe(19);
    expect(item.size).toBe('19 B');
  });

  it('reports a non-zero size for undefined values', async () => {
    await createComponent();
    await emitData({thing: undefined});
    const item = component.transferStateItems()[0];
    expect(item.bytes).toBe(17);
    expect(item.size).toBe('17 B');
  });

  it('does not crash on circular references and reports — for size', async () => {
    await createComponent();
    const circular: Record<string, unknown> = {name: 'loop'};
    circular['self'] = circular;
    await expectAsync(emitData({circ: circular})).not.toBeRejected();
    const item = component.transferStateItems()[0];
    expect(item.bytes).toBeNull();
    expect(item.size).toBe('—');
  });

  it('filters items by key (case-insensitive substring)', async () => {
    await createComponent();
    await emitData({apple: 1, banana: 2, BANANA_PEEL: 3, cherry: 4});
    component.filterText.set('banana');
    expect(component.visibleItems().map((i) => i.key)).toEqual(['banana', 'BANANA_PEEL']);
  });

  it('sorts by raw bytes when sorting size column ascending', async () => {
    await createComponent();
    await emitData({large: 'xxxxxxxxxx', small: 'x', medium: 'xxxxx'});
    component.onSortChange({active: 'size', direction: 'asc'});
    expect(component.visibleItems().map((i) => i.key)).toEqual(['small', 'medium', 'large']);
  });

  it('sorts by key alphabetically when sorting key column ascending', async () => {
    await createComponent();
    await emitData({beta: 1, alpha: 2, gamma: 3});
    component.onSortChange({active: 'key', direction: 'asc'});
    expect(component.visibleItems().map((i) => i.key)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('reverses sort direction when descending', async () => {
    await createComponent();
    await emitData({beta: 1, alpha: 2, gamma: 3});
    component.onSortChange({active: 'key', direction: 'desc'});
    expect(component.visibleItems().map((i) => i.key)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('copies the value to clipboard when copyToClipboard is invoked', async () => {
    await createComponent();
    await emitData({greeting: 'hello'});
    const item = component.transferStateItems()[0];
    component.copyToClipboard(item);
    expect(clipboardSpy.copy).toHaveBeenCalledWith('hello');
    expect(component.transferStateItems()[0].isCopied).toBe(true);
  });

  it('copies non-strings as JSON', async () => {
    await createComponent();
    await emitData({user: {name: 'Alex'}});
    component.copyToClipboard(component.transferStateItems()[0]);
    const arg = clipboardSpy.copy.calls.mostRecent().args[0];
    expect(arg).toContain('"name"');
    expect(arg).toContain('"Alex"');
  });

  it('sets a timeout error if the backend never responds', async () => {
    await createComponent();
    expect(component.isLoading()).toBe(true);
    expect(timeoutCallback).withContext('expected loading timeout to be scheduled').toBeTruthy();
    timeoutCallback!();
    await fixture.whenStable();
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toContain('did not respond');
  });

  it('unsubscribes from the message bus on destroy', async () => {
    await createComponent();
    expect(messageBus.hasListener('transferStateData')).toBe(true);
    fixture.destroy();
    expect(messageBus.hasListener('transferStateData')).toBe(false);
  });

  it('clears the filter when clearFilter is invoked', async () => {
    await createComponent();
    component.filterText.set('hello');
    component.clearFilter();
    expect(component.filterText()).toBe('');
  });
});
