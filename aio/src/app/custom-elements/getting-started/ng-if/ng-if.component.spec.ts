import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgIfComponent } from './ng-if.component';
import { ContainerModule } from '../container/container.module';
import { ProductService } from '../product.service';

describe('Getting Started NgIf Component', () => {
  let component: NgIfComponent;
  let fixture: ComponentFixture<NgIfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ContainerModule ],
      declarations: [ NgIfComponent ],
      providers: [ ProductService ]
    });

    fixture = TestBed.createComponent(NgIfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display the message if products are listed', () => {
    const compiled = fixture.debugElement.nativeElement;
    const paragraph = compiled.querySelector('p');

    expect(paragraph.textContent).toContain('available');
  });

  it('should not display the message if products list is empty', () => {
    component.products$.next([]);
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const paragraph = compiled.querySelector('p');

    expect(paragraph).toBeFalsy();
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
