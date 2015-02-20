import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {PipeRegistry} from 'angular2/src/change_detection/pipes/pipe_registry';
import {Pipe} from 'angular2/src/change_detection/pipes/pipe';

export function main() {
  describe("pipe registry", () => {
    var firstPipe = new Pipe();
    var secondPipe = new Pipe();

    it("should return the first pipe supporting the data type", () => {
      var r = new PipeRegistry({
        "type": [
          new PipeFactory(false, firstPipe),
          new PipeFactory(true, secondPipe)
        ]
      });

      expect(r.get("type", "some object")).toBe(secondPipe);
    });

    it("should throw when no matching type", () => {
      var r = new PipeRegistry({});
      expect(() => r.get("unknown", "some object")).toThrowError(
        `Cannot find a pipe for type 'unknown' object 'some object'`
      );
    });

    it("should throw when no matching pipe", () => {
      var r = new PipeRegistry({
        "type" : []
      });

      expect(() => r.get("type", "some object")).toThrowError(
        `Cannot find a pipe for type 'type' object 'some object'`
      );
    });
  });
}

class PipeFactory {
  shouldSupport:boolean;
  pipe:any;

  constructor(shouldSupport:boolean, pipe:any) {
    this.shouldSupport = shouldSupport;
    this.pipe = pipe;
  }

  supports(obj):boolean {
    return this.shouldSupport;
  }

  create():Pipe {
    return this.pipe;
  }
}