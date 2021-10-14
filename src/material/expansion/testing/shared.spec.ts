import {ComponentHarness, HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatAccordionTogglePosition, MatExpansionModule} from '@angular/material/expansion';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatAccordionHarness} from './accordion-harness';
import {MatExpansionPanelHarness} from './expansion-harness';

/**
 * Function that can be used to run the shared expansion harness tests for either
 * the non-MDC or MDC based expansion harness.
 */
export function runHarnessTests(
  expansionModule: typeof MatExpansionModule,
  accordionHarness: typeof MatAccordionHarness,
  expansionPanelHarness: typeof MatExpansionPanelHarness,
) {
  let fixture: ComponentFixture<ExpansionHarnessTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [expansionModule, NoopAnimationsModule],
      declarations: [ExpansionHarnessTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpansionHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be able to load accordion', async () => {
    const accordions = await loader.getAllHarnesses(accordionHarness);
    expect(accordions.length).toBe(2);
  });

  it('should be able to load an accordion by selector', async () => {
    const accordions = await loader.getAllHarnesses(
      accordionHarness.with({selector: '#accordion2'}),
    );
    expect(accordions.length).toBe(1);
  });

  it('should be able to load expansion panels', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness);
    expect(panels.length).toBe(5);
  });

  it('should be able to load expansion panel by title matching regex', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness.with({title: /Panel#2/}));
    expect(panels.length).toBe(1);
    expect(await panels[0].getTitle()).toBe('Title of Panel#2');
  });

  it('should be able to load expansion panel by title matching exact text', async () => {
    const panels = await loader.getAllHarnesses(
      expansionPanelHarness.with({title: 'Standalone Panel Title'}),
    );
    expect(panels.length).toBe(1);
    expect(await panels[0].getTitle()).toBe('Standalone Panel Title');
  });

  it('should be able to load expansion panel without title', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness.with({title: null}));
    expect(panels.length).toBe(1);
  });

  it('should be able to load expansion panel by description matching regex', async () => {
    const panels = await loader.getAllHarnesses(
      expansionPanelHarness.with({description: /Panel#2/}),
    );
    expect(panels.length).toBe(1);
    expect(await panels[0].getDescription()).toBe('Description of Panel#2');
  });

  it('should be able to load expansion panel by description matching exact text', async () => {
    const panels = await loader.getAllHarnesses(
      expansionPanelHarness.with({description: 'Description of Panel#1'}),
    );
    expect(panels.length).toBe(1);
    expect(await panels[0].getDescription()).toBe('Description of Panel#1');
  });

  it('should be able to load expansion panel without description', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness.with({description: null}));
    expect(panels.length).toBe(3);
  });

  it('should be able to load expanded panels', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness.with({expanded: true}));
    expect(panels.length).toBe(2);
    expect(await panels[0].getTitle()).toBe('Title of Panel#2');
    expect(await panels[1].getTitle()).toBe('Standalone Panel Title');
  });

  it('should be able to load collapsed panels', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness.with({expanded: false}));
    expect(panels.length).toBe(3);
    expect(await panels[0].getTitle()).toBe('Title of Panel#1');
    expect(await panels[1].getTextContent()).toBe('Accordion #2 - Content');
    expect(await panels[2].getTitle()).toBe('Disabled Panel Title');
  });

  it('should be able to load expansion panel by content matching regex', async () => {
    const panels = await loader.getAllHarnesses(
      expansionPanelHarness.with({content: /Accordion #2/}),
    );
    expect(panels.length).toBe(1);
    expect(await panels[0].getTextContent()).toBe('Accordion #2 - Content');
  });

  it('should be able to load expansion panel by content matching exact string', async () => {
    const panels = await loader.getAllHarnesses(
      expansionPanelHarness.with({content: 'Content of Panel#2'}),
    );
    expect(panels.length).toBe(1);
    expect(await panels[0].getTextContent()).toBe('Content of Panel#2');
  });

  it('should be able to load expansion panels based on disabled state', async () => {
    const panels = await loader.getAllHarnesses(expansionPanelHarness.with({disabled: true}));
    expect(panels.length).toBe(1);
    expect(await panels[0].getTitle()).toBe('Disabled Panel Title');
  });

  it('should be able to get expansion state of panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness.with({title: /Panel#1/}));
    expect(await panel.isExpanded()).toBe(false);
    fixture.componentInstance.panel1Expanded = true;
    expect(await panel.isExpanded()).toBe(true);
  });

  it('should be able to get title of panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness.with({content: /Panel#1/}));
    expect(await panel.getTitle()).toBe('Title of Panel#1');
    fixture.componentInstance.panel1Title = 'new title';
    expect(await panel.getTitle()).toBe('new title');
  });

  it('should be able to get description of panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness.with({content: /Panel#1/}));
    expect(await panel.getDescription()).toBe('Description of Panel#1');
    fixture.componentInstance.panel1Description = 'new description';
    expect(await panel.getDescription()).toBe('new description');
  });

  it('should be able to get disabled state of panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness.with({selector: '#disabledPanel'}));
    expect(await panel.isDisabled()).toBe(true);
    fixture.componentInstance.isDisabled = false;
    expect(await panel.isDisabled()).toBe(false);
  });

  it('should be able to toggle expansion state of panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness);
    expect(await panel.isExpanded()).toBe(false);
    await panel.toggle();
    expect(await panel.isExpanded()).toBe(true);
  });

  it('should be able to expand a panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness);
    expect(await panel.isExpanded()).toBe(false);
    await panel.expand();
    expect(await panel.isExpanded()).toBe(true);
    // checking a second time to ensure it does not modify
    // the state if already expanded.
    await panel.expand();
    expect(await panel.isExpanded()).toBe(true);
  });

  it('should be able to collapse a panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness);
    expect(await panel.isExpanded()).toBe(false);
    await panel.expand();
    expect(await panel.isExpanded()).toBe(true);
    await panel.collapse();
    expect(await panel.isExpanded()).toBe(false);
    // checking a second time to ensure it does not modify
    // the state if already collapsed.
    await panel.collapse();
    expect(await panel.isExpanded()).toBe(false);
  });

  it('should be able to get text content of expansion panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness);
    expect(await panel.getTextContent()).toBe('Content of Panel#1');
    fixture.componentInstance.panel1Content = 'new content';
    expect(await panel.getTextContent()).toBe('new content');
  });

  it('should be able to get harness loader for content of panel', async () => {
    const panel = await loader.getHarness(
      expansionPanelHarness.with({selector: '#standalonePanel'}),
    );
    const matchedHarnesses = await panel.getAllHarnesses(TestContentHarness);
    expect(matchedHarnesses.length).toBe(1);
    expect(await matchedHarnesses[0].getText()).toBe('Part of expansion panel');
  });

  it('should be able to focus expansion panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness);
    expect(getActiveElementTag()).not.toBe('mat-expansion-panel-header');
    await panel.focus();
    expect(getActiveElementTag()).toBe('mat-expansion-panel-header');
  });

  it('should be able to blur expansion panel', async () => {
    const panel = await loader.getHarness(expansionPanelHarness);
    await panel.focus();
    expect(getActiveElementTag()).toBe('mat-expansion-panel-header');
    await panel.blur();
    expect(getActiveElementTag()).not.toBe('mat-expansion-panel-header');
  });

  it('should be able to check if expansion panel has toggle indicator', async () => {
    const accordion = await loader.getHarness(accordionHarness);
    const standalonePanel = await loader.getHarness(
      expansionPanelHarness.with({selector: '#standalonePanel'}),
    );
    const expansionPanels = [standalonePanel, ...(await accordion.getExpansionPanels())];
    let toggleIndicatorChecks = await parallel(() => {
      return expansionPanels.map(p => p.hasToggleIndicator());
    });
    expect(toggleIndicatorChecks.every(s => s)).toBe(true);
    fixture.componentInstance.hideToggleIndicators = true;
    toggleIndicatorChecks = await parallel(() => expansionPanels.map(p => p.hasToggleIndicator()));
    expect(toggleIndicatorChecks.every(s => !s)).toBe(true);
  });

  it('should be able to get toggle indicator position of panels', async () => {
    const accordion = await loader.getHarness(accordionHarness);
    const standalonePanel = await loader.getHarness(
      expansionPanelHarness.with({selector: '#standalonePanel'}),
    );
    const expansionPanels = [standalonePanel, ...(await accordion.getExpansionPanels())];
    let togglePositions = await parallel(() =>
      expansionPanels.map(p => p.getToggleIndicatorPosition()),
    );
    expect(togglePositions.every(p => p === 'after')).toBe(true);
    fixture.componentInstance.toggleIndicatorsPosition = 'before';
    togglePositions = await parallel(() => {
      return expansionPanels.map(p => p.getToggleIndicatorPosition());
    });
    expect(togglePositions.every(p => p === 'before')).toBe(true);
  });

  it('should be able to get expansion panels of accordion', async () => {
    const accordion = await loader.getHarness(accordionHarness);
    const panels = await accordion.getExpansionPanels();
    expect(panels.length).toBe(2);
    expect(await panels[0].getTitle()).toBe('Title of Panel#1');
    expect(await panels[1].getTitle()).toBe('Title of Panel#2');
  });

  it('should be able to get expansion panels of accordion with filter', async () => {
    const accordion = await loader.getHarness(accordionHarness);
    const panels = await accordion.getExpansionPanels({title: /Panel#1/});
    expect(panels.length).toBe(1);
    expect(await panels[0].getTitle()).toBe('Title of Panel#1');
  });

  it('should be able to check if accordion has multi panel support enabled', async () => {
    const accordion = await loader.getHarness(accordionHarness);
    expect(await accordion.isMulti()).toBe(false);
    fixture.componentInstance.multiMode = true;
    expect(await accordion.isMulti()).toBe(true);
  });
}

function getActiveElementTag() {
  return document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
}

@Component({
  template: `
    <mat-accordion id="accordion1" [hideToggle]="hideToggleIndicators"
                   [togglePosition]="toggleIndicatorsPosition"
                   [multi]="multiMode">
      <mat-expansion-panel [expanded]="panel1Expanded" id="panel1">
        <mat-expansion-panel-header>
          <mat-panel-title>{{panel1Title}}</mat-panel-title>
          <mat-panel-description>{{panel1Description}}</mat-panel-description>
        </mat-expansion-panel-header>
        {{panel1Content}}
      </mat-expansion-panel>
      <mat-expansion-panel expanded>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Title of Panel#2
          </mat-panel-title>
          <mat-panel-description>
            Description of Panel#2
          </mat-panel-description>
        </mat-expansion-panel-header>
        Content of Panel#2
      </mat-expansion-panel>
    </mat-accordion>

    <mat-accordion id="accordion2">
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          Accordion #2 - Header
        </mat-expansion-panel-header>
        <p>Accordion #2 - Content</p>
      </mat-expansion-panel>
    </mat-accordion>

    <mat-expansion-panel id="standalonePanel" expanded
                         [hideToggle]="hideToggleIndicators"
                         [togglePosition]="toggleIndicatorsPosition">
      <mat-expansion-panel-header>
        <mat-panel-title>Standalone Panel Title</mat-panel-title>
      </mat-expansion-panel-header>
      <div>
        <span>Standalone Panel Body</span>
        <div class="test-content-harness">Part of expansion panel</div>
      </div>
    </mat-expansion-panel>

    <mat-expansion-panel id="disabledPanel" [disabled]="isDisabled">
      <mat-expansion-panel-header>
        <mat-panel-title>Disabled Panel Title</mat-panel-title>
      </mat-expansion-panel-header>
    </mat-expansion-panel>

    <div class="test-content-harness">Outside of expansion panel</div>
  `,
})
class ExpansionHarnessTestComponent {
  panel1Expanded = false;
  panel1Title = 'Title of Panel#1';
  panel1Description = 'Description of Panel#1';
  panel1Content = 'Content of Panel#1';
  hideToggleIndicators = false;
  toggleIndicatorsPosition: MatAccordionTogglePosition;
  isDisabled = true;
  multiMode = false;
}

class TestContentHarness extends ComponentHarness {
  static hostSelector = '.test-content-harness';

  async getText() {
    return (await this.host()).text();
  }
}
