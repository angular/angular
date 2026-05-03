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

  function createComponent(): void {
    fixture = TestBed.createComponent(TransferStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function emitData(data: Record<string, TransferStateValue> | null): void {
    messageBus.emitToListener('transferStateData', data);
    fixture.detectChanges();
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

  it('creates the component and emits getTransferState on init', () => {
    createComponent();
    expect(component).toBeTruthy();
    expect(messageBus.emit).toHaveBeenCalledWith('getTransferState');
    expect(messageBus.hasListener('transferStateData')).toBe(true);
  });

  it('starts in the loading state until data arrives', () => {
    createComponent();
    expect(component.isLoading()).toBe(true);
    emitData({});
    expect(component.isLoading()).toBe(false);
  });

  it('treats backend null as empty (educational state)', () => {
    createComponent();
    emitData(null);
    expect(component.isLoading()).toBe(false);
    expect(component.hasData()).toBe(false);
    expect(component.transferStateData()).toEqual({});
  });

  it('renders the table when data has entries', () => {
    createComponent();
    emitData({greeting: 'hello', count: 3});
    expect(component.hasData()).toBe(true);
    expect(component.transferStateItems().length).toBe(2);
  });

  it('computes UTF-8 byte size correctly', () => {
    createComponent();
    // "héllo" in UTF-8: h(1) + é(2) + l(1) + l(1) + o(1) = 6 bytes.
    // Strings are measured raw (not JSON-stringified), so no quotes counted.
    emitData({greeting: 'héllo'});
    const item = component.transferStateItems()[0];
    expect(item.bytes).toBe(6);
    expect(item.size).toBe('6 B');
  });

  it('reports undefined size as 0 B', () => {
    createComponent();
    emitData({thing: undefined});
    const item = component.transferStateItems()[0];
    expect(item.bytes).toBe(0);
    expect(item.size).toBe('0 B');
  });

  it('does not crash on circular references and reports — for size', () => {
    createComponent();
    const circular: Record<string, unknown> = {name: 'loop'};
    circular['self'] = circular;
    expect(() => emitData({circ: circular})).not.toThrow();
    const item = component.transferStateItems()[0];
    expect(item.bytes).toBeNull();
    expect(item.size).toBe('—');
  });

  it('filters items by key (case-insensitive substring)', () => {
    createComponent();
    emitData({apple: 1, banana: 2, BANANA_PEEL: 3, cherry: 4});
    component.filterText.set('banana');
    expect(component.visibleItems().map((i) => i.key)).toEqual(['banana', 'BANANA_PEEL']);
  });

  it('sorts by raw bytes when sorting size column ascending', () => {
    createComponent();
    emitData({large: 'xxxxxxxxxx', small: 'x', medium: 'xxxxx'});
    component.onSortChange({active: 'size', direction: 'asc'});
    expect(component.visibleItems().map((i) => i.key)).toEqual(['small', 'medium', 'large']);
  });

  it('sorts by key alphabetically when sorting key column ascending', () => {
    createComponent();
    emitData({beta: 1, alpha: 2, gamma: 3});
    component.onSortChange({active: 'key', direction: 'asc'});
    expect(component.visibleItems().map((i) => i.key)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('reverses sort direction when descending', () => {
    createComponent();
    emitData({beta: 1, alpha: 2, gamma: 3});
    component.onSortChange({active: 'key', direction: 'desc'});
    expect(component.visibleItems().map((i) => i.key)).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('copies the value to clipboard when copyToClipboard is invoked', () => {
    createComponent();
    emitData({greeting: 'hello'});
    const item = component.transferStateItems()[0];
    component.copyToClipboard(item);
    expect(clipboardSpy.copy).toHaveBeenCalledWith('hello');
    expect(component.transferStateItems()[0].isCopied).toBe(true);
  });

  it('copies non-strings as JSON', () => {
    createComponent();
    emitData({user: {name: 'Alex'}});
    component.copyToClipboard(component.transferStateItems()[0]);
    const arg = clipboardSpy.copy.calls.mostRecent().args[0];
    expect(arg).toContain('"name"');
    expect(arg).toContain('"Alex"');
  });

  it('sets a timeout error if the backend never responds', () => {
    createComponent();
    expect(component.isLoading()).toBe(true);
    expect(timeoutCallback).withContext('expected loading timeout to be scheduled').toBeTruthy();
    timeoutCallback!();
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toContain('did not respond');
  });

  it('unsubscribes from the message bus on destroy', () => {
    createComponent();
    expect(messageBus.hasListener('transferStateData')).toBe(true);
    fixture.destroy();
    expect(messageBus.hasListener('transferStateData')).toBe(false);
  });

  it('clears the filter when clearFilter is invoked', () => {
    createComponent();
    component.filterText.set('hello');
    component.clearFilter();
    expect(component.filterText()).toBe('');
  });
});
