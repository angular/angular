import {signal} from '@angular/core';
import {FieldContext, FieldState} from '../../public_api';
import {DYNAMIC} from '../../src/logic_node';
import {LogicNodeBuilder} from '../../src/logic_node_2';

const fakeFieldContext: FieldContext<unknown> = {
  fieldOf: () => undefined!,
  stateOf: <P>() =>
    ({
      context: undefined,
      structure: {pathKeys: () => [], parent: undefined},
    }) as unknown as FieldState<P>,
  valueOf: () => undefined!,
  field: undefined!,
  state: undefined!,
  value: undefined!,
};

describe('LogicNodeBuilder', () => {
  it('should build logic', () => {
    // (p) => {
    //   validate(p, () => ({kind: 'root-err'}));
    // };

    const builder = LogicNodeBuilder.newRoot();
    builder.addSyncErrorRule(() => [{kind: 'custom:root-err'}]);

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:root-err'},
    ]);
  });

  it('should build child logic', () => {
    // (p) => {
    //   validate(p.a, () => ({kind: 'child-err'}));
    // };

    const builder = LogicNodeBuilder.newRoot();
    builder.getChild('a').addSyncErrorRule(() => [{kind: 'custom:root-err'}]);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:root-err'},
    ]);
  });

  it('should build merged logic', () => {
    // (p) => {
    //   validate(p, () => ({kind: 'custom:err-1'}));
    //   validate(p, () => ({kind: 'custom:err-2'}));
    // };

    const builder = LogicNodeBuilder.newRoot();
    builder.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot();
    builder2.addSyncErrorRule(() => [{kind: 'custom:err-2'}]);
    builder.mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
      {kind: 'custom:err-2'},
    ]);
  });

  it('should build merged child logic', () => {
    // (p) => {
    //   validate(p.a, () => ({kind: 'custom:err-1'}));
    //   validate(p.a, () => ({kind: 'custom:err-2'}));
    // };

    const builder = LogicNodeBuilder.newRoot();
    builder.getChild('a').addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot();
    builder2.getChild('a').addSyncErrorRule(() => [{kind: 'custom:err-2'}]);
    builder.mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
      {kind: 'custom:err-2'},
    ]);
  });

  it('should build logic with predicate', () => {
    // (p) => {
    //   applyWhen(p, pred, (p) => {
    //     validate(p, () => ({kind: 'custom:err-1'}));
    //   });
    // }

    const builder = LogicNodeBuilder.newRoot();

    const pred = signal(true);
    const builder2 = LogicNodeBuilder.newRoot();
    builder2.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);
    builder.mergeIn(builder2, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([{kind: 'custom:err-1'}]);

    pred.set(false);
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should apply predicate to merged in logic', () => {
    // (p) => {
    //   applyWhen(p, pred, (p) => {
    //     apply(p, (p) => {
    //       validate(p, () => ({kind: 'custom:err-1'}));
    //     });
    //   });
    // }

    const builder = LogicNodeBuilder.newRoot();

    const pred = signal(true);
    const builder2 = LogicNodeBuilder.newRoot();

    const builder3 = LogicNodeBuilder.newRoot();
    builder3.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    builder2.mergeIn(builder3);
    builder.mergeIn(builder2, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([{kind: 'custom:err-1'}]);

    pred.set(false);
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should apply predicate to merged in child logic', () => {
    // (p) => {
    //   applyWhen(p, pred, (p) => {
    //     apply(p, (p) => {
    //       validate(p.a, () => ({kind: 'custom:err-1'}));
    //     });
    //   });
    // }

    const builder = LogicNodeBuilder.newRoot();

    const pred = signal(true);
    const builder2 = LogicNodeBuilder.newRoot();

    const builder3 = LogicNodeBuilder.newRoot();
    builder3.getChild('a').addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    builder2.mergeIn(builder3);
    builder.mergeIn(builder2, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
    ]);

    pred.set(false);
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should combine predicates', () => {
    // (p) => {
    //   applyWhen(p, pred, (p) => {
    //     applyWhen(p.a, pred2, (a) => {
    //       validate(a, () => ({kind: 'custom:err-1'}));
    //     });
    //   });
    // }

    const builder = LogicNodeBuilder.newRoot();

    const pred = signal(true);
    const builder2 = LogicNodeBuilder.newRoot();

    const pred2 = signal(true);
    const builder3 = LogicNodeBuilder.newRoot();
    builder3.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    builder2.getChild('a').mergeIn(builder3, {fn: () => pred2(), path: undefined!});
    builder.mergeIn(builder2, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
    ]);

    pred.set(false);
    pred2.set(true);
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([]);

    pred.set(true);
    pred2.set(false);
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should propagate predicates through deep application', () => {
    // (p) => {
    //   applyWhen(p, pred, (p) => {
    //     validate(p.a.b, () => ({kind: 'custom:err-1'}));
    //     applyWhen(p.a, pred2, (a) => {
    //       validate(a.b, () => ({kind: 'custom:err-2'}));
    //       applyWhen(a.b, pred3, (b) => {
    //         validate(b, () => ({kind: 'custom:err-3'}));
    //       });
    //     });
    //   });
    // }

    const builder = LogicNodeBuilder.newRoot();

    const pred = signal(true);
    const builder2 = LogicNodeBuilder.newRoot();
    builder2
      .getChild('a')
      .getChild('b')
      .addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    const pred2 = signal(true);
    const builder3 = LogicNodeBuilder.newRoot();
    builder3.getChild('b').addSyncErrorRule(() => [{kind: 'custom:err-2'}]);

    const pred3 = signal(true);
    const builder4 = LogicNodeBuilder.newRoot();
    builder4.addSyncErrorRule(() => [{kind: 'custom:err-3'}]);
    builder3.getChild('b').mergeIn(builder4, {fn: () => pred3(), path: undefined!});
    builder2.getChild('a').mergeIn(builder3, {fn: () => pred2(), path: undefined!});
    builder.mergeIn(builder2, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(
      logicNode.getChild('a').getChild('b').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([{kind: 'custom:err-1'}, {kind: 'custom:err-2'}, {kind: 'custom:err-3'}]);

    pred.set(true);
    pred2.set(true);
    pred3.set(false);
    expect(
      logicNode.getChild('a').getChild('b').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([{kind: 'custom:err-1'}, {kind: 'custom:err-2'}]);

    pred.set(true);
    pred2.set(false);
    pred3.set(true);
    expect(
      logicNode.getChild('a').getChild('b').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([{kind: 'custom:err-1'}]);

    pred.set(false);
    pred2.set(true);
    pred3.set(true);
    expect(
      logicNode.getChild('a').getChild('b').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([]);
  });

  it('should propagate predicates through deep child access', () => {
    // (p) => {
    //   applyWhen(p, pred, (p) => {
    //     applyEach(p.items, (i) => {
    //       validate(i.last, () => ({kind: 'custom:err-1'}));
    //     });
    //   });
    // };

    const builder = LogicNodeBuilder.newRoot();

    const pred = signal(true);
    const builder2 = LogicNodeBuilder.newRoot();

    const builder3 = LogicNodeBuilder.newRoot();
    builder3.getChild('last').addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    builder2.getChild('items').getChild(DYNAMIC).mergeIn(builder3);
    builder.mergeIn(builder2, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(
      logicNode
        .getChild('items')
        .getChild(DYNAMIC)
        .getChild('last')
        .logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([{kind: 'custom:err-1'}]);

    pred.set(false);
    expect(
      logicNode
        .getChild('items')
        .getChild(DYNAMIC)
        .getChild('last')
        .logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([]);
  });

  it('should preserve ordering across merges', () => {
    // (p) => {
    //   validate(p, () => ({kind: 'custom:err-1'}));
    //   apply(p, (p) => {
    //     validate(p, () => ({kind: 'custom:err-2'}));
    //   })
    //   validate(p, () => ({kind: 'custom:err-3'}));
    // };

    const builder = LogicNodeBuilder.newRoot();
    builder.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot();
    builder2.addSyncErrorRule(() => [{kind: 'custom:err-2'}]);
    builder.mergeIn(builder2);

    builder.addSyncErrorRule(() => [{kind: 'custom:err-3'}]);

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
      {kind: 'custom:err-2'},
      {kind: 'custom:err-3'},
    ]);
  });

  it('should preserve child ordering across merges', () => {
    // (p) => {
    //   validate(p.a, () => ({kind: 'custom:err-1'}));
    //   apply(p, (p) => {
    //     validate(p.a, () => ({kind: 'custom:err-2'}));
    //   })
    //   validate(p.a, () => ({kind: 'custom:err-3'}));
    // };

    const builder = LogicNodeBuilder.newRoot();
    builder.getChild('a').addSyncErrorRule(() => [{kind: 'custom:err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot();
    builder2.getChild('a').addSyncErrorRule(() => [{kind: 'custom:err-2'}]);
    builder.mergeIn(builder2);

    builder.getChild('a').addSyncErrorRule(() => [{kind: 'custom:err-3'}]);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
      {kind: 'custom:err-2'},
      {kind: 'custom:err-3'},
    ]);
  });

  it('should support circular logic structures', () => {
    // const s = schema((p) => {
    //   validate(p, () => ({kind: 'custom:err-1'})),
    //   apply(p.next, s);
    // }));

    const builder = LogicNodeBuilder.newRoot();
    builder.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);
    builder.getChild('next').mergeIn(builder);

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([{kind: 'custom:err-1'}]);
    expect(logicNode.getChild('next').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
    ]);
    expect(
      logicNode.getChild('next').getChild('next').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([{kind: 'custom:err-1'}]);
  });

  it('should support circular logic structures with predicate', () => {
    // const s = schema((p) => {
    //   validate(p, () => ({kind: 'custom:err-1'})),
    //   applyWhen(p.next, pred, s);
    // }));

    const pred = signal(true);
    const builder = LogicNodeBuilder.newRoot();
    builder.addSyncErrorRule(() => [{kind: 'custom:err-1'}]);
    builder.getChild('next').mergeIn(builder, {fn: () => pred(), path: undefined!});

    const logicNode = builder.build();
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([{kind: 'custom:err-1'}]);
    expect(logicNode.getChild('next').logic.syncErrors.compute(fakeFieldContext)).toEqual([
      {kind: 'custom:err-1'},
    ]);
    expect(
      logicNode.getChild('next').getChild('next').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([{kind: 'custom:err-1'}]);

    // TODO: test that verifies that the same predicate can resolve with a different field context
    // on `.next` vs on `.next.next`
    pred.set(false);
    expect(logicNode.logic.syncErrors.compute(fakeFieldContext)).toEqual([{kind: 'custom:err-1'}]);
    expect(logicNode.getChild('next').logic.syncErrors.compute(fakeFieldContext)).toEqual([]);
    expect(
      logicNode.getChild('next').getChild('next').logic.syncErrors.compute(fakeFieldContext),
    ).toEqual([]);
  });
});
