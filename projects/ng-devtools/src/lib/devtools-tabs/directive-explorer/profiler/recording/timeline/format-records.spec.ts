import { formatRecords, TimelineView } from './format-records';
import { AppRecord, ComponentEventType, LifeCycleEventType } from 'protocol';

describe('format records', () => {
  it('should work with empty app records', () => {
    const result: TimelineView = {
      aggregated: {
        app: [],
        timeSpent: 0,
        source: '',
      },
      timeline: [
        {
          app: [],
          timeSpent: 0,
          source: '',
        },
      ],
    };
    expect(formatRecords([])).toEqual(result);
  });

  it('should work with component events', () => {
    const data = formatRecords([
      {
        recordType: 'component',
        timestamp: 0,
        component: 'foo',
        id: [0],
        event: ComponentEventType.Create,
        duration: 10,
        state: { props: {} },
      },
      {
        recordType: 'component',
        timestamp: 0,
        component: 'bar',
        id: [0, 1],
        event: ComponentEventType.Create,
        duration: 20,
        state: { props: {} },
      },
      {
        recordType: 'lifecycle',
        event: LifeCycleEventType.ChangeDetectionStart,
        timestamp: 0,
      },
      {
        recordType: 'lifecycle',
        event: LifeCycleEventType.ChangeDetectionEnd,
        timestamp: 0,
      },
      {
        recordType: 'component',
        timestamp: 0,
        component: 'bar',
        id: [0, 1],
        event: ComponentEventType.ChangeDetection,
        duration: 30,
        state: { props: {} },
      },
    ] as AppRecord[]);
    expect(data).toEqual(appComponentEvents as any);
  });
});

const appComponentEvents = {
  aggregated: {
    app: [
      {
        value: 10,
        label: 'foo',
        duration: 10,
        totalEvents: 1,
        instances: 1,
        children: [
          undefined,
          {
            value: 50,
            label: 'bar',
            duration: 50,
            totalEvents: 2,
            instances: 1,
            children: [],
          },
        ],
      },
    ],
    timeSpent: 60,
    source: '',
  },
  timeline: [
    {
      app: [
        {
          value: 10,
          label: 'foo',
          duration: 10,
          totalEvents: 1,
          instances: 1,
          children: [
            undefined,
            {
              value: 20,
              label: 'bar',
              duration: 20,
              totalEvents: 1,
              instances: 1,
              children: [],
            },
          ],
        },
      ],
      timeSpent: 30,
      source: '',
    },
    {
      app: [],
      timeSpent: 30,
      source: undefined,
    },
  ],
};
