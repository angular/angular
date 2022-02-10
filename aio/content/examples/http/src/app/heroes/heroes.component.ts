import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { Hero } from './hero';
import { HeroesService } from './heroes.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  providers: [HeroesService],
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];
  editHero: Hero | undefined; // the hero currently being edited
  heroName = '';

  constructor(private heroesService: HeroesService, private changeDetectorRef: ChangeDetectorRef) {}

  @ViewChild('heroNameInput') heroNameInput!: ElementRef;
  @ViewChildren('heroEditInput') heroEditInput!: QueryList<ElementRef>;

  ngOnInit() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroesService.getHeroes()
      .subscribe(heroes => (this.heroes = heroes));
  }

  addOrEditHero(name: string): void {
    if (this.editHero) {
      this.edit(name);
    } else {
      this.add(name);
    }
    this.heroName = '';
    this.editHero = undefined;
  }

  add(name: string): void {
    this.editHero = undefined;
    name = name.trim();
    if (!name) {
      return;
    }

    // The server will generate the id for this new hero
    const newHero: Hero = { name } as Hero;
    // #docregion add-hero-subscribe
    this.heroesService
      .addHero(newHero)
      .subscribe(hero => this.heroes.push(hero));
    // #enddocregion add-hero-subscribe
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    // #docregion delete-hero-subscribe
    this.heroesService
      .deleteHero(hero.id)
      .subscribe();
    // #enddocregion delete-hero-subscribe
    /*
    // #docregion delete-hero-no-subscribe
    // oops ... subscribe() is missing so nothing happens
    this.heroesService.deleteHero(hero.id);
    // #enddocregion delete-hero-no-subscribe
    */
  }

  edit(heroName: string) {
    this.update(heroName);
    this.editHero = undefined;
  }

  selectHeroForEditing(hero: Hero) {
    this.editHero = hero;
    this.changeDetectorRef.detectChanges();
    this.heroEditInput.get(0)!.nativeElement.value = hero.name;
    this.heroEditInput.get(0)!.nativeElement.focus();
  }

  search(searchTerm: string) {
    this.editHero = undefined;
    if (searchTerm) {
      this.heroesService
        .searchHeroes(searchTerm)
        .subscribe(heroes => (this.heroes = heroes));
    } else {
      this.getHeroes();
    }
  }

  update(heroName: string) {
    if (this.editHero && this.editHero.name !== heroName) {
      this.heroesService
        .updateHero({...this.editHero, name: heroName})
        .subscribe(hero => {
        // replace the hero in the heroes list with update from server
        const ix = hero ? this.heroes.findIndex(h => h.id === hero.id) : -1;
        if (ix > -1) {
          this.heroes[ix] = hero;
        }
      });
      this.editHero = undefined;
    }
  }
}
