import { buildTimeline, Timeline, TimelineNodeState } from './time-travel-builder';
import { ComponentRecord } from 'protocol';

const creations: ComponentRecord[] = [
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'DemoAppComponent',
    position: [0, 1],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0, 1, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'TodosComponent',
    position: [0, 1, 0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'TodoComponent',
    position: [0, 1, 0, 0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'ZippyComponent',
    position: [0, 1, 1],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
];

const creationResult: Timeline = [
  {
    timestamp: 0,
    timeLineId: jasmine.any(Number) as any,
    roots: [
      {
        name: 'AppComponent',
        instanceState: {
          props: {},
        },
        state: 1,
        children: [
          undefined,
          {
            name: 'DemoAppComponent',
            instanceState: {
              props: {},
            },
            state: 1,
            children: [
              {
                name: 'AppComponent',
                instanceState: {
                  props: {},
                },
                state: 1,
                children: [
                  {
                    name: 'TodosComponent',
                    instanceState: {
                      props: {},
                    },
                    state: 1,
                    children: [
                      {
                        name: 'TodoComponent',
                        instanceState: {
                          props: {},
                        },
                        state: 1,
                        children: [],
                      },
                    ],
                  },
                ],
              },
              {
                name: 'ZippyComponent',
                instanceState: {
                  props: {},
                },
                state: 1,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const creationsAndChangeDetection: ComponentRecord[] = [
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'DemoAppComponent',
    position: [0, 1],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0, 1, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'TodosComponent',
    position: [0, 1, 0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'TodoComponent',
    position: [0, 1, 0, 0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'ZippyComponent',
    position: [0, 1, 1],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213250721,
    component: 'DemoAppComponent',
    state: { props: {} },
    position: [0, 1],
    event: 2,
    duration: 0.004999979864805937,
  },
  {
    recordType: 'component',
    timestamp: 1579213250721,
    component: 'AppComponent',
    state: { props: {} },
    position: [0, 1, 0],
    event: 2,
    duration: 0.014999997802078724,
  },
  {
    recordType: 'component',
    timestamp: 1579213250722,
    component: 'TodosComponent',
    state: { props: {} },
    position: [0, 1, 0, 0],
    event: 2,
    duration: 0.2849999873433262,
  },
  {
    recordType: 'component',
    timestamp: 1579213250722,
    component: 'TodoComponent',
    state: { props: {} },
    position: [0, 1, 0, 0, 0],
    event: 2,
    duration: 0.03500000457279384,
  },
  {
    recordType: 'component',
    timestamp: 1579213250722,
    component: 'ZippyComponent',
    state: { props: {} },
    position: [0, 1, 1],
    event: 2,
    duration: 0.0050000089686363935,
  },
];

const creationsAndChangeDetectionAndCreation: ComponentRecord[] = [
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'DemoAppComponent',
    position: [0, 1],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0, 1, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213250721,
    component: 'DemoAppComponent',
    state: { props: {} },
    position: [0, 1],
    event: 2,
    duration: 0.004999979864805937,
  },
  {
    recordType: 'component',
    timestamp: 1579213250721,
    component: 'AppComponent',
    position: [0, 1, 0],
    state: { props: {} },
    event: 2,
    duration: 0.014999997802078724,
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'TodosComponent',
    position: [0, 1, 0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
];

const creationsAndChangeDetectionAndCreationAndCreation: ComponentRecord[] = [
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'DemoAppComponent',
    position: [0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'AppComponent',
    position: [0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213250721,
    component: 'DemoAppComponent',
    state: { props: {} },
    position: [0],
    event: 2,
    duration: 0.004999979864805937,
  },
  {
    recordType: 'component',
    timestamp: 1579213248411,
    component: 'TodosComponent',
    position: [0, 0],
    event: 0,
    duration: 0,
    state: { props: {} },
  },
  {
    recordType: 'component',
    timestamp: 1579213250721,
    state: { props: {} },
    component: 'AppComponent',
    position: [0, 1],
    event: 2,
    duration: 0.014999997802078724,
  },
];

describe('timelineBuilder', () => {
  it('should work with empty profiling data', () => {
    expect(buildTimeline([])).toEqual([{ roots: [], timestamp: 0, timeLineId: jasmine.any(Number) }]);
  });

  it('should set the initial state', () => {
    expect(buildTimeline(creations)).toEqual(creationResult);
  });

  it('should work with further change detection', () => {
    const timeline = buildTimeline(creationsAndChangeDetection);
    expect(timeline.length).toBe(6);
    expect(timeline[0]).toEqual(creationResult[0]);

    // DemoAppComponent is running CD
    expect(timeline[1].roots[0].children[1].state).toEqual(TimelineNodeState.Check);

    // DemoAppComponent's child is running CD, but DemoAppComponent is not
    expect(timeline[2].roots[0].children[1].children[0].state).toEqual(TimelineNodeState.Check);
    expect(timeline[2].roots[0].children[1].state).toEqual(TimelineNodeState.Default);
  });

  it('should work with a creation after change detection', () => {
    const timeline = buildTimeline(creationsAndChangeDetectionAndCreation);
    expect(timeline.length).toBe(4);

    // DemoAppComponent is running CD
    expect(timeline[1].roots[0].children[1].state).toEqual(TimelineNodeState.Check);

    // DemoAppComponent's child is running CD, but DemoAppComponent is not
    expect(timeline[2].roots[0].children[1].children[0].state).toEqual(TimelineNodeState.Check);
    expect(timeline[2].roots[0].children[1].state).toEqual(TimelineNodeState.Default);

    // No change detection but a new node
    expect(timeline[3].roots[0].children[1].state).toEqual(TimelineNodeState.Default);
    expect(timeline[3].roots[0].children[1].children[0].state).toEqual(TimelineNodeState.Default);
    expect(timeline[3].roots[0].children[1].children[0].children[0].name).toEqual('TodosComponent');
  });

  it('should work with creation of sibling components', () => {
    const timeline = buildTimeline(creationsAndChangeDetectionAndCreationAndCreation);
    expect(timeline.length).toBe(4);

    // Originally the first child of DemoAppComponent is AppComponent
    expect(timeline[0].roots[0].children[0].name).toEqual('AppComponent');

    // // DemoAppComponent is running CD
    expect(timeline[1].roots[0].state).toEqual(TimelineNodeState.Check);

    // DemoAppComponent's change detection completed, which caused
    // creation of TodosComponent
    expect(timeline[2].roots[0].state).toEqual(TimelineNodeState.Default);
    expect(timeline[2].roots[0].children[0].name).toEqual('TodosComponent');
    expect(timeline[2].roots[0].children[1].name).toEqual('AppComponent');
  });
});
