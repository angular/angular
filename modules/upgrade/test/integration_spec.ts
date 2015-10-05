import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
} from 'angular2/test_lib';

import {Component, View, Inject, EventEmitter} from 'angular2/angular2';
import {createUpgradeModule, UpgradeModule} from 'upgrade/upgrade';

export function main() {
  describe('upgrade: ng1 to ng2', () => {
    it('should have angular 1 loaded', () => expect(angular.version.major).toBe(1));

    it('should instantiate ng2 in ng1 template', inject([AsyncTestCompleter], (async) => {
         var Ng2 = Component({selector: 'ng2'})
                       .View({template: `{{ 'NG2' }}`})
                       .Class({constructor: function() {}});

         var element = html("<div>{{ 'ng1-' }}<ng2>~~</ng2>{{ '-ng1' }}</div>");

         var upgradeModule: UpgradeModule = createUpgradeModule();
         upgradeModule.importNg2Component(Ng2);
         upgradeModule.bootstrap(element).ready(() => {
           expect(document.body.textContent).toEqual("ng1-NG2-ng1");
           async.done();
         });
       }));

    it('should instantiate ng1 in ng2 template', inject([AsyncTestCompleter], (async) => {
         var upgradeModule: UpgradeModule = createUpgradeModule();

         var Ng2 = Component({selector: 'ng2-1'})
                       .View({
                         template: `{{ 'ng2(' }}<ng1></ng1>{{ ')' }}`,
                         directives: [upgradeModule.exportAsNg2Component('ng1')]
                       })
                       .Class({constructor: function() {}});

         upgradeModule.ng1Module.directive('ng1',
                                           () => { return {template: 'ng1 {{ "WORKS" }}!'}; });
         upgradeModule.importNg2Component(Ng2);

         var element = html("<div>{{'ng1('}}<ng2-1></ng2-1>{{')'}}</div>");

         upgradeModule.bootstrap(element).ready(() => {
           expect(document.body.textContent).toEqual("ng1(ng2(ng1 WORKS!))");
           async.done();
         });
       }));

    describe('scope/component change-detection', () => {
      it('should interleave scope and component expressions',
         inject([AsyncTestCompleter], (async) => {
           var log = [];
           var l = function(value) {
             log.push(value);
             return value + ';';
           };
           var upgrMod: UpgradeModule = createUpgradeModule();

           upgrMod.ng1Module.directive('ng1a', () => { return {template: "{{ l('ng1a') }}"}; });
           upgrMod.ng1Module.directive('ng1b', () => { return {template: "{{ l('ng1b') }}"}; });
           upgrMod.ng1Module.run(($rootScope) => {
             $rootScope.l = l;
             $rootScope.reset = () => log.length = 0;
           });

           upgrMod.importNg2Component(
               Component({selector: 'ng2'})
                   .View({
                     template: `{{l('2A')}}<ng1a></ng1a>{{l('2B')}}<ng1b></ng1b>{{l('2C')}}`,
                     directives: [
                       upgrMod.exportAsNg2Component('ng1a'),
                       upgrMod.exportAsNg2Component('ng1b')
                     ]
                   })
                   .Class({constructor: function() { this.l = l; }}));

           var element = html("<div>{{reset(); l('1A');}}<ng2>{{l('1B')}}</ng2>{{l('1C')}}</div>");
           upgrMod.bootstrap(element).ready(() => {
             expect(document.body.textContent).toEqual("1A;2A;ng1a;2B;ng1b;2C;1C;");
             // https://github.com/angular/angular.js/issues/12983
             expect(log).toEqual(['1A', '1B', '1C', '2A', '2B', '2C', 'ng1a', 'ng1b']);
             async.done();
           });
         }));
    });

    describe('binding from ng1 to ng2', () => {
      it('should bind properties, events', inject([AsyncTestCompleter], (async) => {
           var upgrMod: UpgradeModule = createUpgradeModule();
           upgrMod.ng1Module.run(($rootScope) => {
             $rootScope.dataA = 'A';
             $rootScope.dataB = 'B';
             $rootScope.modelA = 'initModelA';
             $rootScope.modelB = 'initModelB';
             $rootScope.eventA = '?';
             $rootScope.eventB = '?';
           });
           upgrMod.importNg2Component(
               Component({
                 selector: 'ng2',
                 inputs: ['literal', 'interpolate', 'oneWayA', 'oneWayB', 'twoWayA', 'twoWayB'],
                 outputs:
                     ['eventA', 'eventB', 'twoWayAEmitter: twoWayA', 'twoWayBEmitter: twoWayB']
               })
                   .View({
                     template:
                         "ignore: {{ignore}}; " +
                             "literal: {{literal}}; interpolate: {{interpolate}}; " +
                             "oneWayA: {{oneWayA}}; oneWayB: {{oneWayB}}; " +
                             "twoWayA: {{twoWayA}}; twoWayB: {{twoWayB}}; ({{onChangesCount}})"
                   })
                   .Class({
                     constructor: function() {
                       this.onChangesCount = 0;
                       this.ignore = '-';
                       this.literal = '?';
                       this.interpolate = '?';
                       this.oneWayA = '?';
                       this.oneWayB = '?';
                       this.twoWayA = '?';
                       this.twoWayB = '?';
                       this.eventA = new EventEmitter();
                       this.eventB = new EventEmitter();
                       this.twoWayAEmitter = new EventEmitter();
                       this.twoWayBEmitter = new EventEmitter();
                     },
                     onChanges: function(changes) {
                       var assert = (prop, value) => {
                         if (this[prop] != value) {
                           throw new Error(
                               `Expected: '${prop}' to be '${value}' but was '${this[prop]}'`);
                         }
                       };

                       var assertChange = (prop, value) => {
                         assert(prop, value);
                         if (!changes[prop]) {
                           throw new Error(`Changes record for '${prop}' not found.`);
                         }
                         var actValue = changes[prop].currentValue;
                         if (actValue != value) {
                           throw new Error(
                               `Expected changes record for'${prop}' to be '${value}' but was '${actValue}'`);
                         }
                       };

                       switch (this.onChangesCount++) {
                         case 0:
                           assert('ignore', '-');
                           assertChange('literal', 'Text');
                           assertChange('interpolate', 'Hello world');
                           assertChange('oneWayA', 'A');
                           assertChange('oneWayB', 'B');
                           assertChange('twoWayA', 'initModelA');
                           assertChange('twoWayB', 'initModelB');

                           this.twoWayAEmitter.next('newA');
                           this.twoWayBEmitter.next('newB');
                           this.eventA.next('aFired');
                           this.eventB.next('bFired');
                           break;
                         case 1:
                           assertChange('twoWayA', 'newA');
                           break;
                         case 2:
                           assertChange('twoWayB', 'newB');
                           break;
                         default:
                           throw new Error('Called too many times! ' + JSON.stringify(changes));
                       }
                     }
                   }));
           var element = html(`<div>
              <ng2 literal="Text" interpolate="Hello {{'world'}}"
                   bind-one-way-a="dataA" [one-way-b]="dataB"
                   bindon-two-way-a="modelA" [(two-way-b)]="modelB"
                   on-event-a='eventA=$event' (event-b)="eventB=$event"></ng2>
              | modelA: {{modelA}}; modelB: {{modelB}}; eventA: {{eventA}}; eventB: {{eventB}};
              </div>`);
           upgrMod.bootstrap(element).ready(() => {
             expect(multiTrim(document.body.textContent))
                 .toEqual(
                     "ignore: -; " + "literal: Text; interpolate: Hello world; " +
                     "oneWayA: A; oneWayB: B; twoWayA: initModelA; twoWayB: initModelB; (1) | " +
                     "modelA: initModelA; modelB: initModelB; eventA: ?; eventB: ?;");
             setTimeout(() => {
               // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
               // events, and so without this we would not see the events processed.
               expect(multiTrim(document.body.textContent))
                   .toEqual("ignore: -; " + "literal: Text; interpolate: Hello world; " +
                            "oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (3) | " +
                            "modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;");
               async.done();
             });
           });

         }));
    });
  });
}

function multiTrim(text: string): string {
  return text.replace(/\n/g, '').replace(/\s\s+/g, ' ').trim();
}

function html(html: string): Element {
  var body = document.body;
  body.innerHTML = html;
  if (body.childNodes.length == 1 && body.firstChild instanceof HTMLElement)
    return <Element>body.firstChild;
  return body;
}
