import {isPresent, isBlank, isJsObject, BaseException, FunctionWrapper} from 'angular2/src/facade/lang';
import {List, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {ChangeDispatcher, DirectiveIndex, PipeRegistry, Pipe, WrappedValue} from 'angular2/change_detection';

export class CountingPipe extends Pipe {
  state:number;

  constructor() {
    super();
    this.state = 0;
  }

  supports(newValue) {
    return true;
  }

  transform(value) {
    return `${value} state:${this.state ++}`;
  }
}

export class OncePipe extends Pipe {
  called:boolean;
  destroyCalled:boolean;

  constructor() {
    super();
    this.called = false;
    this.destroyCalled = false;
  }

  supports(newValue) {
    return !this.called;
  }

  onDestroy() {
    this.destroyCalled = true;
  }

  transform(value) {
    this.called = true;
    return value;
  }
}

export class IdentityPipe extends Pipe {
  transform(value) {
    return value;
  }
}

export class WrappedPipe extends Pipe {
  transform(value) {
    return WrappedValue.wrap(value);
  }
}

export class FakePipeRegistry extends PipeRegistry {
  numberOfLookups:number;
  pipeType:string;
  factory:Function;
  cdRef:any;

  constructor(pipeType, factory) {
    super({});
    this.pipeType = pipeType;
    this.factory = factory;
    this.numberOfLookups = 0;
  }

  get(type:string, obj, cdRef) {
    if (type != this.pipeType) return null;
    this.numberOfLookups ++;
    this.cdRef = cdRef;
    return this.factory();
  }
}

export class TestDirective {
  a;
  b;
  changes;
  onChangesDoneCalled;
  onChangesDoneSpy;

  constructor(onChangesDoneSpy = null) {
    this.onChangesDoneCalled = false;
    this.onChangesDoneSpy = onChangesDoneSpy;
    this.a = null;
    this.b = null;
    this.changes = null;
  }

  onChange(changes) {
    var r = {};
    StringMapWrapper.forEach(changes, (c, key) => r[key] = c.currentValue);
    this.changes = r;
  }

  onAllChangesDone() {
    this.onChangesDoneCalled = true;
    if(isPresent(this.onChangesDoneSpy)) {
      this.onChangesDoneSpy();
    }
  }
}

export class Person {
  name:string;
  age:number;
  address:Address;
  constructor(name:string, address:Address = null) {
    this.name = name;
    this.address = address;
  }

  sayHi(m) {
    return `Hi, ${m}`;
  }

  toString():string {
    var address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

export class Address {
  city:string;
  constructor(city:string) {
    this.city = city;
  }

  toString():string {
    return this.city;
  }
}

export class Uninitialized {
  value:any;
}

export class TestData {
  a;

  constructor(a) {
    this.a = a;
  }
}

export class FakeDirectives {
  directives:List;
  detectors:List;

  constructor(directives:List, detectors:List) {
    this.directives = directives;
    this.detectors = detectors;
  }

  getDirectiveFor(di:DirectiveIndex) {
    return this.directives[di.directiveIndex];
  }

  getDetectorFor(di:DirectiveIndex) {
    return this.detectors[di.directiveIndex];
  }
}

export class TestDispatcher extends ChangeDispatcher {
  log:List;
  loggedValues:List;

  constructor() {
    super();
    this.clear();
  }

  clear() {
    this.log = ListWrapper.create();
    this.loggedValues = ListWrapper.create();
  }

  notifyOnBinding(binding, value) {
    ListWrapper.push(this.log, `${binding.propertyName}=${this._asString(value)}`);
    ListWrapper.push(this.loggedValues, value);
  }

  _asString(value) {
    return (isBlank(value) ? 'null' : value.toString());
  }
}
