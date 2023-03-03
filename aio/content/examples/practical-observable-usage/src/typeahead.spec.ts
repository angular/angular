import { of } from 'rxjs';
import { docRegionTypeahead } from './typeahead';

describe('typeahead', () => {
  let document: Document;
  let ajax: jasmine.Spy;
  let tick: MockClock['tick'];
  let triggertInputChange: (e: { target: { value: string } }) => void;

  beforeEach(() => {
    const input = {
      addEventListener: jasmine
        .createSpy('addEvent')
        .and.callFake((eventName: string, cb: (e: unknown) => void) => {
          if (eventName === 'input') {
            triggertInputChange = cb;
          }
        }),
      removeEventListener: jasmine.createSpy('removeEvent'),
    };

    document = { getElementById: (id: string) => input } as unknown as Document;
    ajax = jasmine.createSpy('ajax').and.callFake((url: string) => of('foo bar'));
    tick = MockClock.install();
  });

  it('should make an ajax call to the corrent endpoint', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: 'foo' } });
    tick(11);
    expect(ajax).toHaveBeenCalledWith('/api/endpoint?search=foo');
  });

  it('should not make an ajax call, when the input length < 3', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: '' } });
    tick(11);
    expect(ajax).not.toHaveBeenCalled();
    triggertInputChange({ target: { value: 'fo' } });
    tick(11);
    expect(ajax).not.toHaveBeenCalled();
  });

  it('should not make an ajax call for intermediate values when debouncing', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: 'foo' } });
    tick(9);
    triggertInputChange({ target: { value: 'bar' } });
    tick(9);
    triggertInputChange({ target: { value: 'baz' } });
    tick(9);
    triggertInputChange({ target: { value: 'qux' } });
    expect(ajax).not.toHaveBeenCalled();
    tick(10);
    expect(ajax).toHaveBeenCalledTimes(1);
    expect(ajax).toHaveBeenCalledWith('/api/endpoint?search=qux');
  });

  it('should not make an ajax call, when the input value has not changed', () => {
    docRegionTypeahead(document, ajax);
    triggertInputChange({ target: { value: 'foo' } });
    tick(11);
    expect(ajax).toHaveBeenCalled();
    ajax.calls.reset();
    triggertInputChange({ target: { value: 'foo' } });
    tick(11);
    expect(ajax).not.toHaveBeenCalled();
  });

  // Helpers
  interface MockTask {
    id: ReturnType<typeof setTimeout>;
    fn: () => unknown;
    delay: number;
    recurring: boolean;
    nextTriggerTime: number;
  }

  class MockClock {
    private tasks: MockTask[] = [];

    private constructor(private now: number) {}

    static install(mockTime = 0): MockClock['tick'] {
      const mocked = new this(mockTime);

      spyOn(globalThis, 'clearInterval').and.callFake(id => mocked.clearTask(id as MockTask['id']));
      spyOn(globalThis, 'clearTimeout').and.callFake(id => mocked.clearTask(id as MockTask['id']));
      spyOn(globalThis, 'setInterval').and.callFake(
          ((fn: () => unknown, delay: number, ...args: any[]) =>
            mocked.createTask(fn, delay, true, ...args)) as typeof setInterval);
      spyOn(globalThis, 'setTimeout').and.callFake(
          ((fn: () => unknown, delay: number, ...args: any[]) =>
            mocked.createTask(fn, delay, false, ...args)) as typeof setTimeout);

      spyOn(Date, 'now').and.callFake(() => mocked.now);

      return mocked.tick.bind(mocked);
    }

    private clearTask(id: MockTask['id']): void {
      this.tasks = this.tasks.filter(task => task.id !== id);
    }

    private createTask(
        fn: MockTask['fn'], delay: MockTask['delay'], recurring: MockTask['recurring'],
        ...args: any[]): MockTask['id'] {
      // Avoid infinite loops.
      if (recurring && (delay <= 0)) {
        delay = 1;
      }

      const task: MockTask = {
        id: {} as MockTask['id'],
        fn: fn.bind<null, unknown, unknown>(null, ...args),
        delay,
        recurring,
        nextTriggerTime: this.now + delay,
      };
      this.queueTask(task);

      return task.id;
    }

    private queueTask(task: MockTask): void {
      const firstLaterTaskIdx = this.tasks.findIndex(
          otherTask => otherTask.nextTriggerTime > task.nextTriggerTime);
      const newTaskIdx = (firstLaterTaskIdx === -1) ? this.tasks.length : firstLaterTaskIdx;

      this.tasks.splice(newTaskIdx, 0, task);
    }

    private tick(millis: number): void {
      const finalNow = this.now + millis;

      while (this.tasks[0]?.nextTriggerTime <= finalNow) {
        const task = this.tasks.shift()!;
        this.now = task.nextTriggerTime;

        if (task.recurring) {
          this.queueTask({...task, nextTriggerTime: this.now + task.delay});
        }

        try {
          task.fn();
        } catch (err) {
          console.error(err);
        }
      }

      this.now = finalNow;
    }
  }
});
