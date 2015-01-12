import {describe, it, iit, ddescribe, expect, SpyObject, beforeEach} from 'test_lib/test_lib';
import {Promise, PromiseWrapper} from 'facade/async';
import {Router} from 'router/router';

export function main() {

  describe('Router', () => {
    var router,
        view;

    beforeEach(() => {
      router = new Router();
      view = makeMockComponent('root');
      router.registerViewPort(view);
    });

    describe('config', () => {
      iit('should renavigate after being configured', (done) => {
        router.navigate('/a').then(() => {
          expect(view.activate).not.toHaveBeenCalled();
 
          return router.config([
            { 'path': '/a', 'component': 'A' }
          ]);
        }).then(() => {
          expect(view.activate).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('with a simple config', () => {
      beforeEach(() => {
        router.config([
          { path: '/a', component: 'A' }
        ]);
      });

      it('should activate viewports on navigation', (done) => {
        router.navigate('/a').then(() => {
          expect(view.activate).toHaveBeenCalled();
          done();
        });
     });

      it('should not reactivate when called with the same URL', (done) => {
        router.navigate('/a').then(() => {
          expect(view.activate).toHaveBeenCalled();

          view.activate.calls.reset();

          return router.navigate('/a');
        }).then(() => {
          expect(view.activate).not.toHaveBeenCalled();
          done();
        });
     });

      it('should check if it can navigate', (done) => {
        spyOn(router, 'navigationPredicate').and.callThrough();
        router.canNavigate('/a').then((status) => {
          expect(status).toBe(true);
          expect(router.navigationPredicate).toHaveBeenCalled();
          done();
        });
     });

      it('should check the canActivate hook to see if it can navigate', (done) => {
        view.canActivate = jasmine.createSpy('canActivate component').and.returnValue(true);
        router.canNavigate('/a/b').then((status) => {
          expect(status).toBe(true);

          view.canActivate = jasmine.createSpy('canActivate component').and.returnValue(false);
          return router.canNavigate('/a/b');
        }).then((status) => {
          expect(status).toBe(false);
          done();
        });
      });

      it('should check the canDeactivate hook to see if it can navigate', (done) => {
        view.canDeactivate = jasmine.createSpy('canDeactivate component').and.returnValue(true);
        router.canNavigate('/a/b').then((status) => {
          expect(status).toBe(true);

          view.canDeactivate = jasmine.createSpy('canDeactivate component').and.returnValue(false);
          return router.canNavigate('/a/b');
        }).then((status) => {
          expect(status).toBe(false);
          done();
        });
      });

      it('should generate URLs', () => {
        expect(router.generate('A', {})).toBe('/a');
      });

      it('should navigate viewports registered after a navigation happens', (done) => {
        router = new Router();
        view = makeMockComponent('root');
        router.config([
          { path: '/a', component: 'A' }
        ]);

        router.navigate('/a').then(() => {
          expect(view.activate).not.toHaveBeenCalled();

          router.registerViewPort(view);
          expect(view.activate).toHaveBeenCalled();          
          done();
        });
      });


      describe('with child routers', () => {
        var child, childView;

        beforeEach(() => {
          child = router.childRouter();
          child.config([
            { path: '/b', component: 'B' },
            { path: '/c', component: 'C' }
          ]);
          childView = makeMockComponent('child');
          child.registerViewPort(childView);
        });

        it('should check if it can navigate', (done) => {
          spyOn(child, 'navigationPredicate').and.callThrough();
          router.canNavigate('/a/b').then(() => {
            expect(status).toBe(true);
            expect(child.navigationPredicate).toHaveBeenCalled();
            done();
          });
        });

        it('should activate viewports on navigation', (done) => {
          router.navigate('/a/b').then(() => {
            expect(view.activate).toHaveBeenCalled();
            expect(childView.activate).toHaveBeenCalled();
            done();
          });
        });

        it('should deactivate children when navigating away', (done) => {
          router.config([
            { path: '/d', component: 'D' }
          ]);

          router.navigate('/a/b').then(() => {
            expect(view.activate).toHaveBeenCalled();
            expect(childView.activate).toHaveBeenCalled();

            return router.navigate('/d');
          }).then(() => {
            expect(childView.deactivate).toHaveBeenCalled();
            done();
          });
       });

        it('should not activate parent viewports when the matched segment stays the same', (done) => {
          router.navigate('/a/b').then(() => {
            expect(view.activate).toHaveBeenCalled();
            expect(childView.activate).toHaveBeenCalled();

            view.activate.calls.reset();
            childView.activate.calls.reset();

            return router.navigate('/a/c');
          }).then(() => {
            expect(view.activate).not.toHaveBeenCalled();
            expect(childView.activate).toHaveBeenCalled();

            done();
          });
        });

        it('should not activate viewports if a predicate returns false', (done) => {
          child.navigationPredicate = () => Promise.resolve(false);
          router.navigate('/a/b').then(() => {
            expect(view.activate).not.toHaveBeenCalled();
            expect(childView.activate).not.toHaveBeenCalled();
            done();
          });
        });

        it('should generate URLs', (done) => {
          // a child can't generate a route unless it has been navigated to
          router.navigate('/a/c').then(() => {
            expect(router.generate('A', {})).toBe('/a');
            expect(child.generate('C', {})).toBe('/a/c');
            done();
          });
        });
      });
    });
  });
}

function makeMockComponent (name = '') {
  var spyObj = new SpyObject();
  spyObj.spy('activate').andCallFake(() => PromiseWrapper.resolve(true));
  spyObj.spy('deactivate').andCallFake(() => PromiseWrapper.resolve(true));
  return spyObj;
}
