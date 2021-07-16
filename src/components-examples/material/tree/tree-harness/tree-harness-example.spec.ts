import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTreeHarness} from '@angular/material/tree/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatTreeModule} from '@angular/material/tree';
import {TreeHarnessExample} from './tree-harness-example';
import {MatIconModule} from '@angular/material/icon';

describe('TreeHarnessExample', () => {
  let fixture: ComponentFixture<TreeHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTreeModule, MatIconModule],
      declarations: [TreeHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(TreeHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of children and descendants', async () => {
    const tree = await loader.getHarness(MatTreeHarness);
    const treeDescendants = await tree.getNodes();

    // flat nodes are not rendered until expanded
    expect(treeDescendants.length).toBe(2);

    await treeDescendants[0].expand();

    expect((await tree.getNodes()).length).toBe(5);
  });

  it('should correctly get correct node with text', async () => {
    const tree = await loader.getHarness(MatTreeHarness);
    const treeNodes = await tree.getNodes({text: /Flat Group/});
    expect(treeNodes.length).toBe(2);
    const secondGroup = treeNodes[0];

    expect(await secondGroup.getText()).toBe('Flat Group 1');
    expect(await secondGroup.getLevel()).toBe(1);
    expect(await secondGroup.isDisabled()).toBe(false);
    expect(await secondGroup.isExpanded()).toBe(false);
  });

  it ('should correctly get tree structure', async () => {
    const tree = await loader.getHarness(MatTreeHarness);

    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {text: 'Flat Group 1'},
        {text: 'Flat Group 2'}
      ]
    });

    const firstGroup = (await tree.getNodes({text: /Flat Group 1/}))[0];
    await firstGroup.expand();

    expect(await tree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'Flat Group 1',
          children: [
            {text: 'Flat Leaf 1.1'},
            {text: 'Flat Leaf 1.2'},
            {text: 'Flat Leaf 1.3'}
          ]
        },
        {text: 'Flat Group 2'}
      ]
    });
  });
});
