import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit,
  containsRegexp,
  stringifyElement,
  TestComponentBuilder,
  fakeAsync,
  clearPendingTimers,
  ComponentFixture,
  tick,
  flushMicrotasks,
} from 'angular2/testing_internal';

import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

import {NgZone} from 'angular2/core';

import {isPresent} from 'angular2/src/facade/lang';

import {
  Injector,
  bind,
  provide,
  Injectable,
  Provider,
  forwardRef,
  OpaqueToken,
  Inject,
  Host,
  SkipSelf,
  SkipSelfMetadata,
  OnDestroy
} from 'angular2/core';

import {CompilerConfig} from 'angular2/compiler';

import {
  Directive,
  Component,
  ViewMetadata,
  Attribute,
  Query,
  Pipe,
  Input,
  Output,
  HostBinding,
  HostListener
} from 'angular2/src/core/metadata';

import {AnimationDriver} from 'angular2/src/core/render/animation_driver';
import {MockAnimationDriver} from 'angular2/src/mock/mock_animation_driver';
import {animation, style, animate, group, sequence, AnimationEntryMetadata} from 'angular2/animate';
import {IS_DART} from 'angular2/src/facade/lang';

export function main() {
  if (IS_DART) {
    declareTests();
  } else {
    describe('jit', () => {
      beforeEachProviders(
          () => [provide(CompilerConfig, {useValue: new CompilerConfig(true, false, true)})]);
      declareTests();
    });

    describe('no jit', () => {
      beforeEachProviders(
          () => [provide(CompilerConfig, {useValue: new CompilerConfig(true, false, false)})]);
      declareTests();
    });
  }
}

function declareTests() {
  describe('animation tests', function() {
    beforeEachProviders(() => [provide(AnimationDriver, {useClass: MockAnimationDriver})]);

    var makeAnimationCmp = (tcb: TestComponentBuilder, tpl: string, animationEntry: AnimationEntryMetadata, callback = null) => {
      var fixture: ComponentFixture;
      tcb = tcb.overrideTemplate(DummyIfCmp, tpl);
      tcb = tcb.overrideAnimations(DummyIfCmp, [animationEntry]);
      tcb.createAsync(DummyIfCmp).then((root) => { callback(root); });
      tick();
    };

    describe('animation triggers', () => {
      it('should trigger state change animation from void => state',
         inject([TestComponentBuilder, AnimationDriver, NgZone],
                fakeAsync(
                    (tcb: TestComponentBuilder, driver: MockAnimationDriver, zone: MockNgZone) => {
                      makeAnimationCmp(tcb, '<div *ngIf="exp" @myAnimation="exp"></div>',
                        animation('myAnimation(void => *)', [style({'opacity': 0}), animate({'opacity': 1}, 500)]),
                                       (fixture) => {
                                         var cmp = fixture.debugElement.componentInstance;
                                         cmp.exp = true;
                                         fixture.detectChanges();
                                         flushMicrotasks();
                                         zone.simulateMicrotaskEmpty();

                                         expect(driver.log.length).toEqual(1);

                                         var keyframes2 = driver.log[0]['keyframeLookup'];
                                         expect(keyframes2.length).toEqual(2);
                                         expect(keyframes2[0]).toEqual([0, {'opacity': 0}]);
                                         expect(keyframes2[1]).toEqual([100, {'opacity': 1}]);
                                       });
                    })));

                    /*
      it('should trigger a ngLeave animation',
         inject([TestComponentBuilder, AnimationDriver, NgZone],
                fakeAsync(
                    (tcb: TestComponentBuilder, driver: MockAnimationDriver, zone: MockNgZone) => {

                      makeAnimationCmp(tcb, '<div *ngIf="exp"></div>', 'ngLeave',
                                       [style({'width': 100}), animate({'width': 0}, 500)],
                                       (fixture) => {

                                         var cmp = fixture.debugElement.componentInstance;
                                         cmp.exp = true;
                                         fixture.detectChanges();
                                         flushMicrotasks();
                                         zone.simulateMicrotaskEmpty();

                                         expect(driver.log.length).toEqual(0);

                                         cmp.exp = false;
                                         fixture.detectChanges();
                                         flushMicrotasks();
                                         zone.simulateMicrotaskEmpty();

                                         expect(driver.log.length).toEqual(2);

                                         var keyframes = driver.log[1]['keyframeLookup'];
                                         expect(keyframes[0]).toEqual([0, {'width': 100}]);
                                         expect(keyframes[1]).toEqual([100, {'width': 0}]);
                                       });
                    })));
                   */
    });

    describe('animation operations', () => {
      it('should animate the element when the expression changes',
         inject([TestComponentBuilder, AnimationDriver, NgZone],
                fakeAsync(
                    (tcb: TestComponentBuilder, driver: MockAnimationDriver, zone: MockNgZone) => {
                      tcb.overrideAnimations(DummyIfCmp, [
                       animation("myAnimation(void => *)", [
                        style({'background': 'red'}),
                        animate({'background': 'blue'}, '0.5s 1s ease-out')
                       ])
                      ]).createAsync(DummyIfCmp)
                          .then((fixture) => {
                            tick();

                            var cmp = fixture.debugElement.componentInstance;
                            cmp.exp = true;
                            fixture.detectChanges();

                            flushMicrotasks();
                            zone.simulateMicrotaskEmpty();

                            expect(driver.log.length).toEqual(1);

                            var animation1 = driver.log[0];
                            expect(animation1['duration']).toEqual(500);
                            expect(animation1['delay']).toEqual(1000);
                            expect(animation1['easing']).toEqual('ease-out');

                            var startingStyles = animation1['startingStyles'];
                            expect(startingStyles).toEqual({'background': 'red'});

                            var keyframes = animation1['keyframeLookup'];
                            expect(keyframes[0]).toEqual([0, {'background': 'red'}]);
                            expect(keyframes[1]).toEqual([100, {'background': 'blue'}]);
                          });
                    })));

      it('should combine repeated style steps into a single step',
         inject(
             [TestComponentBuilder, AnimationDriver, NgZone],
             fakeAsync((tcb: TestComponentBuilder, driver: MockAnimationDriver,
                        zone: MockNgZone) => {
                      tcb.overrideAnimations(DummyIfCmp, [
                       animation("myAnimation(void => *)", [
                          style({'background': 'red'}),
                          style({'width': '100px'}),
                          style({'background': 'gold'}),
                          style({'height': 111}),
                          animate({'width': '200px', 'background': 'blue'}, '999ms'),
                          style({'opacity': '1'}),
                          style({'border-width': '100px'}),
                          animate({'opacity': '0', 'height': '200px', 'border-width': '10px'},
                                  '999ms')
                        ])
                      ])
                   .createAsync(DummyIfCmp)
                   .then((fixture) => {
                     tick();

                     var cmp = fixture.debugElement.componentInstance;
                     cmp.exp = true;
                     fixture.detectChanges();

                     flushMicrotasks();
                     zone.simulateMicrotaskEmpty();

                     expect(driver.log.length).toEqual(2);

                     var animation1 = driver.log[0];
                     expect(animation1['duration']).toEqual(999);
                     expect(animation1['delay']).toEqual(0);
                     expect(animation1['easing']).toEqual(null);
                     expect(animation1['startingStyles'])
                         .toEqual({'background': 'gold', 'width': '100px', 'height': 111});

                     var keyframes1 = animation1['keyframeLookup'];
                     expect(keyframes1[0]).toEqual([0, {'background': 'gold', 'width': '100px'}]);
                     expect(keyframes1[1]).toEqual([100, {'background': 'blue', 'width': '200px'}]);

                     var animation2 = driver.log[1];
                     expect(animation2['duration']).toEqual(999);
                     expect(animation2['delay']).toEqual(0);
                     expect(animation2['easing']).toEqual(null);
                     expect(animation2['startingStyles'])
                        .toEqual({'opacity': '1', 'border-width': '100px'});

                     var keyframes2 = animation2['keyframeLookup'];
                     expect(keyframes2[0])
                         .toEqual([0, {'opacity': '1', 'height': 111, 'border-width': '100px'}]);
                     expect(keyframes2[1])
                         .toEqual([100, {'opacity': '0', 'height': '200px', 'border-width': '10px'}]);
                   });
             })));

      describe('groups/sequences', () => {
        var assertPlaying =
            (player, isPlaying) => {
              var method = 'play';
              var lastEntry = player.log.length > 0 ? player.log[player.log.length - 1] : null;
              if (isPresent(lastEntry)) {
                if (isPlaying) {
                  expect(lastEntry).toEqual(method);
                } else {
                  expect(lastEntry).not.toEqual(method);
                }
              }
            }

        it('should run animations in sequence one by one if a top-level array is used',
           inject([TestComponentBuilder, AnimationDriver, NgZone],
                  fakeAsync((tcb: TestComponentBuilder, driver: MockAnimationDriver,
                             zone: MockNgZone) => {
                    tcb.overrideAnimations(DummyIfCmp, [
                                           animation('myAnimation(void => *)', [
                                               style({'opacity': '0'}),
                                               animate({'opacity': '0.5'}, 1000),
                                               animate({'opacity': '0.8'}, '1000ms'),
                                               animate({'opacity': '1'}, '1s'),
                                             ])
                    ])
                        .createAsync(DummyIfCmp)
                        .then((fixture) => {

                          tick();

                          var cmp = fixture.debugElement.componentInstance;
                          cmp.exp = true;
                          fixture.detectChanges();

                          flushMicrotasks();
                          zone.simulateMicrotaskEmpty();

                          expect(driver.log.length).toEqual(3);

                          var player1 = driver.log[0]['player'];
                          var player2 = driver.log[1]['player'];
                          var player3 = driver.log[2]['player'];

                          assertPlaying(player1, true);
                          assertPlaying(player2, false);
                          assertPlaying(player3, false);

                          player1.finish();

                          assertPlaying(player1, false);
                          assertPlaying(player2, true);
                          assertPlaying(player3, false);

                          player2.finish();

                          assertPlaying(player1, false);
                          assertPlaying(player2, false);
                          assertPlaying(player3, true);

                          player3.finish();

                          assertPlaying(player1, false);
                          assertPlaying(player2, false);
                          assertPlaying(player3, false);
                        });
                  })));

        it('should run animations in parallel if a group is used',
           inject(
               [TestComponentBuilder, AnimationDriver, NgZone],
               fakeAsync((tcb: TestComponentBuilder, driver: MockAnimationDriver,
                          zone: MockNgZone) => {
                 tcb.overrideAnimations(DummyIfCmp, [
                   animation("myAnimation(void => *)", [
                            style({'width': 0, 'height': 0}),
                            group([animate({'width': 100}, 1000), animate({'height': 500}, 5000)]),
                            group([animate({'width': 0}, 1000), animate({'height': 0}, 5000)])
                          ])
                 ])
                     .createAsync(DummyIfCmp)
                     .then((fixture) => {

                       tick();

                       var cmp = fixture.debugElement.componentInstance;
                       cmp.exp = true;
                       fixture.detectChanges();

                       flushMicrotasks();
                       zone.simulateMicrotaskEmpty();

                       expect(driver.log.length).toEqual(5);

                       var player1 = driver.log[0]['player'];
                       var player2 = driver.log[1]['player'];
                       var player3 = driver.log[2]['player'];
                       var player4 = driver.log[3]['player'];
                       var player5 = driver.log[4]['player'];

                       assertPlaying(player1, true);
                       assertPlaying(player2, false);
                       assertPlaying(player3, false);
                       assertPlaying(player4, false);
                       assertPlaying(player5, false);

                       player1.finish();

                       assertPlaying(player1, false);
                       assertPlaying(player2, true);
                       assertPlaying(player3, true);
                       assertPlaying(player4, false);
                       assertPlaying(player5, false);

                       player2.finish();

                       assertPlaying(player1, false);
                       assertPlaying(player2, false);
                       assertPlaying(player3, true);
                       assertPlaying(player4, false);
                       assertPlaying(player5, false);

                       player3.finish();

                       assertPlaying(player1, false);
                       assertPlaying(player2, false);
                       assertPlaying(player3, false);
                       assertPlaying(player4, true);
                       assertPlaying(player5, true);
                     });
               })));
      });

      /*
      it('should cancel an existing running animation on the same element when a follow-up structural animation is run',
         inject([TestComponentBuilder, AnimationDriver, NgZone],
                fakeAsync(
                    (tcb: TestComponentBuilder, driver: MockAnimationDriver, zone: MockNgZone) => {
                      tcb.overrideAnimations(
                             DummyIfCmp,
                             {
                               "ngEnter": [style({'width': 0}), animate({'width': 100}, 1000)],
                               "ngLeave": [style({'height': 100}), animate({'height': 0}, 1000)]
                             })
                          .createAsync(DummyIfCmp)
                          .then((fixture) => {

                            tick();

                            var cmp = fixture.debugElement.componentInstance;

                            cmp.exp = true;
                            fixture.detectChanges();
                            flushMicrotasks();
                            zone.simulateMicrotaskEmpty();

                            var enterCompleted = false;
                            var enterPlayer = driver.log[1]['player'];
                            enterPlayer.onDone(() => enterCompleted = true);

                            expect(enterCompleted).toEqual(false);

                            cmp.exp = false;
                            fixture.detectChanges();
                            flushMicrotasks();
                            zone.simulateMicrotaskEmpty();

                            expect(enterCompleted).toEqual(true);
                          });
                    })));

      it('should destroy all animation players once the animation is complete',
         inject([TestComponentBuilder, AnimationDriver, NgZone],
                fakeAsync(
                    (tcb: TestComponentBuilder, driver: MockAnimationDriver, zone: MockNgZone) => {
                      tcb.overrideAnimations(DummyIfCmp,
                                             {
                                               "ngEnter": [
                                                 style({'background': 'red', 'opacity': 0.5}),
                                                 animate({'background': 'black'}, 500),
                                                 group([
                                                   animate({'background': 'black'}, 500),
                                                   animate({'opacity': '0.2'}, 1000),
                                                 ]),
                                                 sequence([
                                                   animate({'opacity': '1'}, 500),
                                                   animate({'background': 'white'}, 1000)
                                                 ])
                                               ]
                                             })
                          .createAsync(DummyIfCmp)
                          .then((fixture) => {
                            tick();

                            var cmp = fixture.debugElement.componentInstance;
                            cmp.exp = true;
                            fixture.detectChanges();

                            flushMicrotasks();
                            zone.simulateMicrotaskEmpty();

                            expect(driver.log.length).toEqual(6);

                            driver.log.forEach(entry => entry['player'].finish());
                            driver.log.forEach(entry => {
                              var player = entry['player'];
                              expect(player.log[player.log.length - 2]).toEqual('finish');
                              expect(player.log[player.log.length - 1]).toEqual('destroy');
                            });
                          });
                    })));
    });
    */

    it('should use first matched animation when multiple animations are registered',
       inject(
           [TestComponentBuilder, AnimationDriver, NgZone],
           fakeAsync((tcb: TestComponentBuilder, driver: MockAnimationDriver, zone: MockNgZone) => {
             tcb = tcb.overrideTemplate(DummyIfCmp, `
                      <div @rotate="exp"></div>
                      <div @rotate="exp2"></div>
                    `);
             tcb.overrideAnimations(DummyIfCmp, [
               animation("rotate(start => *)", [style({'color': 'white'}), animate({'color': 'red'}, 500)]),
               animation("rotate(start => end)", [style({'color': 'white'}), animate({'color': 'pink'}, 500)]),
             ]).createAsync(DummyIfCmp)
                 .then((fixture) => {
                   tick();

                   var cmp = fixture.debugElement.componentInstance;
                   cmp.exp = 'start';
                   cmp.exp2 = 'start';
                   fixture.detectChanges();
                   flushMicrotasks();
                   zone.simulateMicrotaskEmpty();

                   expect(driver.log.length).toEqual(0);

                   cmp.exp = 'something';
                   fixture.detectChanges();
                   flushMicrotasks();
                   zone.simulateMicrotaskEmpty();

                   expect(driver.log.length).toEqual(1);

                   var animation1 = driver.log[0];
                   var keyframes1 = animation1['keyframeLookup'];
                   var toStyles1 = keyframes1[1][1];
                   expect(toStyles1['color']).toEqual('red');

                   cmp.exp2 = 'end';
                   fixture.detectChanges();
                   flushMicrotasks();
                   zone.simulateMicrotaskEmpty();

                   expect(driver.log.length).toEqual(2);

                   var animation2 = driver.log[1];
                   var keyframes2 = animation2['keyframeLookup'];
                   var toStyles2 = keyframes2[1][1];
                   expect(toStyles2['color']).toEqual('red');
                 });
           })));
    });
  });
}

@Component({
  selector: 'if-cmp',
  template: `
    <div *ngIf="exp" @myAnimation="exp"></div>
  `
})
class DummyIfCmp {
  exp = false;
  exp2 = false;
}
