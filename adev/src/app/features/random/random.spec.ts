import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import Random from './random';
import {SUB_NAVIGATION_DATA} from '../../routing/sub-navigation-data';

describe('Random', () => {
  let component: Random;
  let fixture: ComponentFixture<Random>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [Random],
      providers: [{provide: Router, useValue: routerSpy}],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Random);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to a random path on init', () => {
    fixture.detectChanges(); // Triggers ngOnInit

    expect(router.navigateByUrl).toHaveBeenCalled();
    const call = (router.navigateByUrl as jasmine.Spy).calls.mostRecent();
    const navigatedUrl = call.args[0];
    const options = call.args[1];

    expect(options.replaceUrl).toBeTrue();

    // Check if navigatedUrl is one of the possible paths
    const allPaths = [
      ...SUB_NAVIGATION_DATA.docs,
      ...SUB_NAVIGATION_DATA.reference,
      ...SUB_NAVIGATION_DATA.tutorials,
    ].flatMap((item) => {
      const paths: string[] = [];
      const traverse = (node: any) => {
        if (node.path && !node.path.startsWith('http')) paths.push(`/${node.path}`);
        if (node.children) node.children.forEach(traverse);
      };
      traverse(item);
      return paths;
    });

    expect(allPaths).toContain(navigatedUrl);
  });
});
