export async function foo(...[, {a}, {b: [{c: d}]}]: any[]) {
  await a;
  await d;
}
