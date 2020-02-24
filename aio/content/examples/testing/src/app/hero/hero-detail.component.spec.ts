// #docplaster
import {
  async, ComponentFixture, fakeAsync, inject, TestBed, tick
} from '@angular/core/testing';

import { Router }       from '@angular/router';

import {
  ActivatedRoute, ActivatedRouteStub, asyncData, click, newEvent
} from '../../testing';

import { Hero }                from '../model/hero';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroDetailService }   from './hero-detail.service';
import { HeroModule }          from './hero.module';

////// Testing Vars //////
let activatedRoute: ActivatedRouteStub;
let component: HeroDetailComponent;
let fixture: ComponentFixture<HeroDetailComponent>;
let page: Page;

////// Tests //////
describe('HeroDetailComponent', () => {
  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
  });
  describe('with HeroModule setup', heroModuleSetup);
  describe('when override its provided HeroDetailService', overrideSetup);
  describe('with FormsModule setup', formsModuleSetup);
  describe('with SharedModule setup', sharedModuleSetup);
});

///////////////////

function overrideSetup() {
  // #docregion hds-spy
  class HeroDetailServiceSpy {
    testHero: Hero = {id: 42, name: 'Test Hero' };

    /* 히어로 객체를 복사해서 보냅니다. */
    getHero = jasmine.createSpy('getHero').and.callFake(
      () => asyncData(Object.assign({}, this.testHero))
    );

    /* 복사한 히어로 객체에 변경사항을 반영해서 보냅니다. */
    saveHero = jasmine.createSpy('saveHero').and.callFake(
      (hero: Hero) => asyncData(Object.assign(this.testHero, hero))
    );
  }

  // #enddocregion hds-spy

  // the `id` value is irrelevant because ignored by service stub
  beforeEach(() => activatedRoute.setParamMap({ id: 99999 }));

  // #docregion setup-override
  beforeEach(async(() => {
    const routerSpy = createRouterSpy();

    TestBed.configureTestingModule({
      imports:   [ HeroModule ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router,         useValue: routerSpy},
  // #enddocregion setup-override
        // HeroDetailService at this level is IRRELEVANT!
        { provide: HeroDetailService, useValue: {} }
  // #docregion setup-override
      ]
    })

    // 컴포넌트에 등록된 프로바이더를 오버라이드합니다.
    // #docregion override-component-method
    .overrideComponent(HeroDetailComponent, {
      set: {
        providers: [
          { provide: HeroDetailService, useClass: HeroDetailServiceSpy }
        ]
      }
    })
    // #enddocregion override-component-method

    .compileComponents();
  }));
  // #enddocregion setup-override

  // #docregion override-tests
  let hdsSpy: HeroDetailServiceSpy;

  beforeEach(async(() => {
    createComponent();
    // 컴포넌트에 주입된 HeroDetailServiceSpy를 참조합니다.
    hdsSpy = fixture.debugElement.injector.get(HeroDetailService) as any;
  }));

  it('should have called `getHero`', () => {
    expect(hdsSpy.getHero.calls.count()).toBe(1, 'getHero called once');
  });

  it('should display stub hero\'s name', () => {
    expect(page.nameDisplay.textContent).toBe(hdsSpy.testHero.name);
  });

  it('should save stub hero change', fakeAsync(() => {
    const origName = hdsSpy.testHero.name;
    const newName = 'New Name';

    page.nameInput.value = newName;
    page.nameInput.dispatchEvent(newEvent('input')); // 값이 변경되었다는 이벤트를 보냅니다.

    expect(component.hero.name).toBe(newName, 'component hero has new name');
    expect(hdsSpy.testHero.name).toBe(origName, 'service hero unchanged before save');

    click(page.saveBtn);
    expect(hdsSpy.saveHero.calls.count()).toBe(1, 'saveHero called once');

    tick(); // 비동기 저장 로직이 끝나는 것을 기다립니다.
    expect(hdsSpy.testHero.name).toBe(newName, 'service hero has new name after save');
    expect(page.navigateSpy.calls.any()).toBe(true, 'router.navigate called');
  }));
  // #enddocregion override-tests

  it('fixture injected service is not the component injected service',
    // inject gets the service from the fixture
    inject([HeroDetailService], (fixtureService: HeroDetailService) => {

    // use `fixture.debugElement.injector` to get service from component
    const componentService = fixture.debugElement.injector.get(HeroDetailService);

    expect(fixtureService).not.toBe(componentService, 'service injected from fixture');
  }));
}

////////////////////
import { getTestHeroes, TestHeroService, HeroService } from '../model/testing/test-hero.service';

const firstHero = getTestHeroes()[0];

function heroModuleSetup() {
  // #docregion setup-hero-module
  beforeEach(async(() => {
    const routerSpy = createRouterSpy();

    TestBed.configureTestingModule({
      imports:   [ HeroModule ],
  // #enddocregion setup-hero-module
  //  declarations: [ HeroDetailComponent ], // NO!  DOUBLE DECLARATION
  // #docregion setup-hero-module
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HeroService,    useClass: TestHeroService },
        { provide: Router,         useValue: routerSpy},
      ]
    })
    .compileComponents();
  }));
  // #enddocregion setup-hero-module

  // #docregion route-good-id
  describe('when navigate to existing hero', () => {
    let expectedHero: Hero;

    beforeEach(async(() => {
      expectedHero = firstHero;
      activatedRoute.setParamMap({ id: expectedHero.id });
      createComponent();
    }));

  // #docregion selected-tests
    it('should display that hero\'s name', () => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  // #enddocregion route-good-id

    it('should navigate when click cancel', () => {
      click(page.cancelBtn);
      expect(page.navigateSpy.calls.any()).toBe(true, 'router.navigate called');
    });

    it('should save when click save but not navigate immediately', () => {
      // 컴포넌트로 의존성 주입된 서비스를 참조하고, `saveHero` 메소드에 스파이를 연결합니다.
      // 테스트 코드를 안전하게 실행하기 위해, `HeroDetailService.saveHero` 메소드는 목 클래스에 만든 `HeroService.updateHero`를 사용합니다.
      const hds = fixture.debugElement.injector.get(HeroDetailService);
      const saveSpy = spyOn(hds, 'saveHero').and.callThrough();

      click(page.saveBtn);
      expect(saveSpy.calls.any()).toBe(true, 'HeroDetailService.save called');
      expect(page.navigateSpy.calls.any()).toBe(false, 'router.navigate not called');
    });

    it('should navigate when click save and save resolves', fakeAsync(() => {
      click(page.saveBtn);
      tick(); // 비동기 저장 작업이 종료될 때까지 기다립니다.
      expect(page.navigateSpy.calls.any()).toBe(true, 'router.navigate called');
    }));

    // #docregion title-case-pipe
    it('should convert hero name to Title Case', () => {
      // 이름에 해당하는 input 엘리먼트와 이 이름을 화면에 표시하는 span 엘리먼트를 DOM에서 참조합니다.
      const hostElement = fixture.nativeElement;
      const nameInput: HTMLInputElement = hostElement.querySelector('input');
      const nameDisplay: HTMLElement = hostElement.querySelector('span');

      // 사용자가 입력한 것처럼 입력 필드의 내용을 변경합니다.
      nameInput.value = 'quick BROWN  fOx';

      // 엘리먼트의 값이 변경되었다는 것을 Angular에게 알리기 위해 DOM 이벤트를 생성합니다.
      // use newEvent utility function (not provided by Angular) for better browser compatibility
      nameInput.dispatchEvent(newEvent('input'));

      // Angular가 화면을 갱신하도록 detectChanges() 함수를 실행합니다.
      fixture.detectChanges();

      expect(nameDisplay.textContent).toBe('Quick Brown  Fox');
    });
    // #enddocregion title-case-pipe
  // #enddocregion selected-tests
  // #docregion route-good-id
  });
  // #enddocregion route-good-id

  // #docregion route-no-id
  describe('when navigate with no hero id', () => {
    beforeEach(async( createComponent ));

    it('should have hero.id === 0', () => {
      expect(component.hero.id).toBe(0);
    });

    it('should display empty hero name', () => {
      expect(page.nameDisplay.textContent).toBe('');
    });
  });
  // #enddocregion route-no-id

  // #docregion route-bad-id
  describe('when navigate to non-existent hero id', () => {
    beforeEach(async(() => {
      activatedRoute.setParamMap({ id: 99999 });
      createComponent();
    }));

    it('should try to navigate back to hero list', () => {
      expect(page.gotoListSpy.calls.any()).toBe(true, 'comp.gotoList called');
      expect(page.navigateSpy.calls.any()).toBe(true, 'router.navigate called');
    });
  });
  // #enddocregion route-bad-id

  // Why we must use `fixture.debugElement.injector` in `Page()`
  it('cannot use `inject` to get component\'s provided HeroDetailService', () => {
    let service: HeroDetailService;
    fixture = TestBed.createComponent(HeroDetailComponent);
    expect(
      // Throws because `inject` only has access to TestBed's injector
      // which is an ancestor of the component's injector
      inject([HeroDetailService], (hds: HeroDetailService) =>  service = hds )
    )
    .toThrowError(/No provider for HeroDetailService/);

    // get `HeroDetailService` with component's own injector
    service = fixture.debugElement.injector.get(HeroDetailService);
    expect(service).toBeDefined('debugElement.injector');
  });
}

/////////////////////
import { FormsModule }         from '@angular/forms';
import { TitleCasePipe }       from '../shared/title-case.pipe';

function formsModuleSetup() {
 // #docregion setup-forms-module
  beforeEach(async(() => {
    const routerSpy = createRouterSpy();

    TestBed.configureTestingModule({
      imports:      [ FormsModule ],
      declarations: [ HeroDetailComponent, TitleCasePipe ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HeroService,    useClass: TestHeroService },
        { provide: Router,         useValue: routerSpy},
      ]
    })
    .compileComponents();
  }));
  // #enddocregion setup-forms-module

  it('should display 1st hero\'s name', async(() => {
    const expectedHero = firstHero;
    activatedRoute.setParamMap({ id: expectedHero.id });
    createComponent().then(() => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  }));
}

///////////////////////
import { SharedModule }        from '../shared/shared.module';

function sharedModuleSetup() {
  // #docregion setup-shared-module
  beforeEach(async(() => {
    const routerSpy = createRouterSpy();

    TestBed.configureTestingModule({
      imports:      [ SharedModule ],
      declarations: [ HeroDetailComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: HeroService,    useClass: TestHeroService },
        { provide: Router,         useValue: routerSpy},
      ]
    })
    .compileComponents();
  }));
  // #enddocregion setup-shared-module

  it('should display 1st hero\'s name', async(() => {
    const expectedHero = firstHero;
    activatedRoute.setParamMap({ id: expectedHero.id });
    createComponent().then(() => {
      expect(page.nameDisplay.textContent).toBe(expectedHero.name);
    });
  }));
}

/////////// Helpers /////

// #docregion create-component
/** HeroDetailComponent의 인스턴스를 생성하고, 초기화하며, 테스트 변수를 할당합니다. */
function createComponent() {
  fixture = TestBed.createComponent(HeroDetailComponent);
  component = fixture.componentInstance;
  page = new Page(fixture);

  // 첫번째 변화 감지 로직이 동작하면 히어로 데이터를 가져오는 ngOnInit이 실행됩니다.
  fixture.detectChanges();
  return fixture.whenStable().then(() => {
    // 두번째 변화 감지 로직이 동작하면 비동기로 가져온 히어로 데이터가 화면에 표시됩니다.
    fixture.detectChanges();
  });
}
// #enddocregion create-component

// #docregion page
class Page {
  // DOM에서 원하는 엘리먼트를 참조하는 게터 함수를 정의합니다.
  get buttons()     { return this.queryAll<HTMLButtonElement>('button'); }
  get saveBtn()     { return this.buttons[0]; }
  get cancelBtn()   { return this.buttons[1]; }
  get nameDisplay() { return this.query<HTMLElement>('span'); }
  get nameInput()   { return this.query<HTMLInputElement>('input'); }

  gotoListSpy: jasmine.Spy;
  navigateSpy:  jasmine.Spy;

  constructor(fixture: ComponentFixture<HeroDetailComponent>) {
    // 의존성 객체로 주입된 라우터 스파이 객체를 참조합니다.
    const routerSpy = <any> fixture.debugElement.injector.get(Router);
    this.navigateSpy = routerSpy.navigate;

    // 컴포넌트의 `gotoList()` 메소드에 스파이를 적용합니다.
    const component = fixture.componentInstance;
    this.gotoListSpy = spyOn(component, 'gotoList').and.callThrough();
  }

  //// 쿼리 헬퍼 ////
  private query<T>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return fixture.nativeElement.querySelectorAll(selector);
  }
}
// #enddocregion page

function createRouterSpy() {
  return jasmine.createSpyObj('Router', ['navigate']);
}
