import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, Provider, Type, ViewChild} from '@angular/core';
import {MatCardModule} from './module';
import {MatCard, MAT_CARD_CONFIG} from './card';

describe('MDC-based MatCard', () => {
  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatCardModule],
      declarations: [component],
      providers,
    }).compileComponents();

    return TestBed.createComponent<T>(component);
  }

  it('should default the card to the `raised` appearance', () => {
    const fixture = createComponent(BasicCard);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.mat-mdc-card');
    expect(card.classList).not.toContain('mdc-card--outlined');
  });

  it('should be able to change the card appearance', () => {
    const fixture = createComponent(BasicCard);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.mat-mdc-card');

    expect(card.classList).not.toContain('mdc-card--outlined');

    fixture.componentInstance.card.appearance = 'outlined';
    fixture.detectChanges();

    expect(card.classList).toContain('mdc-card--outlined');
  });

  it('should be able to change the default card appearance using DI', () => {
    const fixture = createComponent(BasicCard, [
      {
        provide: MAT_CARD_CONFIG,
        useValue: {appearance: 'outlined'},
      },
    ]);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.mat-mdc-card');
    expect(card.classList).toContain('mdc-card--outlined');
  });
});

@Component({
  template: '<mat-card></mat-card>',
})
class BasicCard {
  @ViewChild(MatCard) card: MatCard;
}
