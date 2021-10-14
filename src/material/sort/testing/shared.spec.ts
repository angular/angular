import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSortModule, Sort} from '@angular/material/sort';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSortHarness} from './sort-harness';

/** Shared tests to run on both the original and MDC-based sort. */
export function runHarnessTests(
  sortModule: typeof MatSortModule,
  sortHarness: typeof MatSortHarness,
) {
  let fixture: ComponentFixture<SortHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [sortModule, NoopAnimationsModule],
      declarations: [SortHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SortHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for mat-sort', async () => {
    const sorts = await loader.getAllHarnesses(sortHarness);
    expect(sorts.length).toBe(1);
  });

  it('should load the harnesses for all the headers in a mat-sort', async () => {
    const sort = await loader.getHarness(sortHarness);
    const headers = await sort.getSortHeaders();
    expect(headers.length).toBe(5);
  });

  it('should be able to filter headers by their label text', async () => {
    const sort = await loader.getHarness(sortHarness);
    const headers = await sort.getSortHeaders({label: 'Carbs'});
    expect(headers.length).toBe(1);
    expect(await headers[0].getLabel()).toBe('Carbs');
  });

  it('should be able to filter headers by their labels via a regex', async () => {
    const sort = await loader.getHarness(sortHarness);
    const headers = await sort.getSortHeaders({label: /^C/});
    const labels = await parallel(() => headers.map(header => header.getLabel()));
    expect(headers.length).toBe(2);
    expect(labels).toEqual(['Calories', 'Carbs']);
  });

  it('should be able to filter headers by their sorted state', async () => {
    const sort = await loader.getHarness(sortHarness);
    let headers = await sort.getSortHeaders({sortDirection: ''});
    expect(headers.length).toBe(5);

    await headers[0].click();

    headers = await sort.getSortHeaders({sortDirection: 'asc'});

    expect(headers.length).toBe(1);
  });

  it('should be able to get the label of a header', async () => {
    const sort = await loader.getHarness(sortHarness);
    const headers = await sort.getSortHeaders();
    const labels = await parallel(() => headers.map(header => header.getLabel()));
    expect(labels).toEqual(['Dessert', 'Calories', 'Fat', 'Carbs', 'Protein']);
  });

  it('should get the disabled state of a header', async () => {
    const sort = await loader.getHarness(sortHarness);
    const thirdHeader = (await sort.getSortHeaders())[2];

    expect(await thirdHeader.isDisabled()).toBe(false);

    fixture.componentInstance.disableThirdHeader = true;
    fixture.detectChanges();

    expect(await thirdHeader.isDisabled()).toBe(true);
  });

  it('should get the active state of a header', async () => {
    const sort = await loader.getHarness(sortHarness);
    const secondHeader = (await sort.getSortHeaders())[1];

    expect(await secondHeader.isActive()).toBe(false);

    await secondHeader.click();

    expect(await secondHeader.isActive()).toBe(true);
  });

  it('should get the sorte direction of a header', async () => {
    const sort = await loader.getHarness(sortHarness);
    const secondHeader = (await sort.getSortHeaders())[1];

    expect(await secondHeader.getSortDirection()).toBe('');

    await secondHeader.click();
    expect(await secondHeader.getSortDirection()).toBe('asc');

    await secondHeader.click();
    expect(await secondHeader.getSortDirection()).toBe('desc');
  });

  it('should get the active header', async () => {
    const sort = await loader.getHarness(sortHarness);
    const fifthHeader = (await sort.getSortHeaders())[4];

    expect(await sort.getActiveHeader()).toBeNull();

    await fifthHeader.click();

    const activeHeader = await sort.getActiveHeader();
    expect(activeHeader).toBeTruthy();
    expect(await activeHeader!.getLabel()).toBe('Protein');
  });
}

@Component({
  template: `
    <table matSort (matSortChange)="sortData($event)">
      <tr>
        <th mat-sort-header="name">Dessert</th>
        <th mat-sort-header="calories">Calories</th>
        <th mat-sort-header="fat" [disabled]="disableThirdHeader">Fat</th>
        <th mat-sort-header="carbs">Carbs</th>
        <th mat-sort-header="protein">Protein</th>
      </tr>

      <tr *ngFor="let dessert of sortedData">
        <td>{{dessert.name}}</td>
        <td>{{dessert.calories}}</td>
        <td>{{dessert.fat}}</td>
        <td>{{dessert.carbs}}</td>
        <td>{{dessert.protein}}</td>
      </tr>
    </table>
  `,
})
class SortHarnessTest {
  disableThirdHeader = false;
  desserts = [
    {name: 'Frozen yogurt', calories: 159, fat: 6, carbs: 24, protein: 4},
    {name: 'Ice cream sandwich', calories: 237, fat: 9, carbs: 37, protein: 4},
    {name: 'Eclair', calories: 262, fat: 16, carbs: 24, protein: 6},
    {name: 'Cupcake', calories: 305, fat: 4, carbs: 67, protein: 4},
    {name: 'Gingerbread', calories: 356, fat: 16, carbs: 49, protein: 4},
  ];

  sortedData = this.desserts.slice();

  sortData(sort: Sort) {
    const data = this.desserts.slice();

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
    } else {
      this.sortedData = data.sort((a, b) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
}
