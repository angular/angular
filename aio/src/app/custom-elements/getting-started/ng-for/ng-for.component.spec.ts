import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgForComponent } from './ng-for.component';
import { ContainerModule } from '../container/container.module';
import { ProductService } from '../product.service';

describe('Getting Started NgFor Component', () => {
  let component: NgForComponent;
  let fixture: ComponentFixture<NgForComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ContainerModule ],
      declarations: [ NgForComponent ],
      providers: [ ProductService ]
    });

    fixture = TestBed.createComponent(NgForComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display the products', () => {
    const compiled = fixture.debugElement.nativeElement;
    const spans = compiled.querySelectorAll('span');

    expect(spans[0]!.textContent).toContain('Shoes');
    expect(spans[1]!.textContent).toContain('Phones');
  });

  it('should display an error message if provided products JSON is invalid', () => {
    fixture.detectChanges();

    component.productsData$.next('bad');

    fixture.detectChanges();

    component.parseError$.subscribe(error => {
      expect(error).toBeTruthy();
    })
  });
});
