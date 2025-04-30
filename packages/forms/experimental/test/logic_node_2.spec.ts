import {signal} from '@angular/core';
import {FieldContext} from '../public_api';
import {LogicNodeBuilder} from '../src/logic_node_2';

const fakeFieldContext: FieldContext<unknown> = {
  resolve: () =>
    ({
      $state: {fieldContext: fakeFieldContext},
    }) as any,
  value: undefined!,
};

describe('LogicNodeBuilder', () => {
  it('should build logic', () => {
    // (p) => {
    //   validate(p, () => ({kind: 'root-err'}));
    // };

    const builder = LogicNodeBuilder.newRoot(undefined);
    builder.addErrorRule(() => [{kind: 'root-err'}]);

    const logicNode = builder.build();
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'root-err'}]);
  });

  it('should build child logic', () => {
    // (p) => {
    //   validate(p.a, () => ({kind: 'child-err'}));
    // };

    const builder = LogicNodeBuilder.newRoot(undefined);
    builder.getChild('a').addErrorRule(() => [{kind: 'root-err'}]);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'root-err'},
    ]);
  });

  it('should build merged logic', () => {
    // (p) => {
    //   validate(p, () => ({kind: 'err-1'}));
    //   validate(p, () => ({kind: 'err-2'}));
    // };

    const builder = LogicNodeBuilder.newRoot(undefined);
    builder.addErrorRule(() => [{kind: 'err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot(undefined);
    builder2.addErrorRule(() => [{kind: 'err-2'}]);
    builder.mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);
  });

  it('should build merged child logic', () => {
    // (p) => {
    //   validate(p.a, () => ({kind: 'err-1'}));
    //   validate(p.a, () => ({kind: 'err-2'}));
    // };

    const builder = LogicNodeBuilder.newRoot(undefined);
    builder.getChild('a').addErrorRule(() => [{kind: 'err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot(undefined);
    builder2.getChild('a').addErrorRule(() => [{kind: 'err-2'}]);
    builder.mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);
  });

  it('should build logic with predicate', () => {
    // applyWhen(p, pred, (p) => {
    //   validate(p, () => ({kind: 'err-1'}));
    // };

    const pred = signal(true);
    const builder = LogicNodeBuilder.newRoot({fn: pred, path: undefined!});
    builder.addErrorRule(() => [{kind: 'err-1'}]);

    const logicNode = builder.build();
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    pred.set(false);
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should apply predicate to merged in logic', () => {
    // applyWhen(p, pred, (p) => {
    //   apply(p, (p) => {
    //     validate(p, () => ({kind: 'err-1'}));
    //   });
    // };

    const pred = signal(true);
    const builder = LogicNodeBuilder.newRoot({fn: pred, path: undefined!});

    const builder2 = LogicNodeBuilder.newRoot(undefined);
    builder2.addErrorRule(() => [{kind: 'err-1'}]);
    builder.mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([{kind: 'err-1'}]);

    pred.set(false);
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should apply predicate to merged in child logic', () => {
    // applyWhen(p, pred, (p) => {
    //   apply(p, (p) => {
    //     validate(p.a, () => ({kind: 'err-1'}));
    //   });
    // });

    const pred = signal(true);
    const builder = LogicNodeBuilder.newRoot({fn: pred, path: undefined!});

    const builder2 = LogicNodeBuilder.newRoot(undefined);
    builder2.getChild('a').addErrorRule(() => [{kind: 'err-1'}]);
    builder.mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
    ]);

    pred.set(false);
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should combine predicates', () => {
    // applyWhen(p, pred, (p) => {
    //   applyWhen(p.a, pred2, (a) => {
    //     validate(a, () => ({kind: 'err-1'}));
    //   });
    // });

    const pred = signal(true);
    const builder = LogicNodeBuilder.newRoot({fn: pred, path: undefined!});

    const pred2 = signal(true);
    const builder2 = LogicNodeBuilder.newRoot({fn: pred2, path: undefined!});
    builder2.addErrorRule(() => [{kind: 'err-1'}]);
    builder.getChild('a').mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
    ]);

    pred.set(false);
    pred2.set(true);
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([]);

    pred.set(true);
    pred2.set(false);
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([]);
  });

  it('should deeply propagate predicates', () => {
    // applyWhen(p, pred, (p) => {
    //   validate(p.a.b, () => ({kind: 'err-1'}));
    //   applyWhen(p.a, pred2, (a) => {
    //     validate(a.b, () => ({kind: 'err-2'}));
    //     applyWhen(a.b, pred3, (b) => {
    //       validate(b, () => ({kind: 'err-3'}));
    //     });
    //   });
    // });

    const pred = signal(true);
    const builder = LogicNodeBuilder.newRoot({fn: pred, path: undefined!});
    builder
      .getChild('a')
      .getChild('b')
      .addErrorRule(() => [{kind: 'err-1'}]);

    const pred2 = signal(true);
    const builder2 = LogicNodeBuilder.newRoot({fn: pred2, path: undefined!});
    builder2.getChild('b').addErrorRule(() => [{kind: 'err-2'}]);

    const pred3 = signal(true);
    const builder3 = LogicNodeBuilder.newRoot({fn: pred3, path: undefined!});
    builder3.addErrorRule(() => [{kind: 'err-3'}]);

    builder2.getChild('b').mergeIn(builder3);
    builder.getChild('a').mergeIn(builder2);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').getChild('b').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
      {kind: 'err-3'},
    ]);

    pred.set(true);
    pred2.set(true);
    pred3.set(false);
    expect(logicNode.getChild('a').getChild('b').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
    ]);

    pred.set(true);
    pred2.set(false);
    pred3.set(true);
    expect(logicNode.getChild('a').getChild('b').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
    ]);

    pred.set(false);
    pred2.set(true);
    pred3.set(true);
    expect(logicNode.getChild('a').getChild('b').logic.errors.compute(fakeFieldContext)).toEqual(
      [],
    );
  });

  it('should preserve ordering across merges', () => {
    // (p) => {
    //   validate(p, () => ({kind: 'err-1'}));
    //   apply(p, (p) => {
    //     validate(p, () => ({kind: 'err-2'}));
    //   })
    //   validate(p, () => ({kind: 'err-3'}));
    // };

    const builder = LogicNodeBuilder.newRoot(undefined);
    builder.addErrorRule(() => [{kind: 'err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot(undefined);
    builder2.addErrorRule(() => [{kind: 'err-2'}]);
    builder.mergeIn(builder2);

    builder.addErrorRule(() => [{kind: 'err-3'}]);

    const logicNode = builder.build();
    expect(logicNode.logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
      {kind: 'err-3'},
    ]);
  });

  it('should preserve child ordering across merges', () => {
    // (p) => {
    //   validate(p.a, () => ({kind: 'err-1'}));
    //   apply(p, (p) => {
    //     validate(p.a, () => ({kind: 'err-2'}));
    //   })
    //   validate(p.a, () => ({kind: 'err-3'}));
    // };

    const builder = LogicNodeBuilder.newRoot(undefined);
    builder.getChild('a').addErrorRule(() => [{kind: 'err-1'}]);

    const builder2 = LogicNodeBuilder.newRoot(undefined);
    builder2.getChild('a').addErrorRule(() => [{kind: 'err-2'}]);
    builder.mergeIn(builder2);

    builder.getChild('a').addErrorRule(() => [{kind: 'err-3'}]);

    const logicNode = builder.build();
    expect(logicNode.getChild('a').logic.errors.compute(fakeFieldContext)).toEqual([
      {kind: 'err-1'},
      {kind: 'err-2'},
      {kind: 'err-3'},
    ]);
  });
});
