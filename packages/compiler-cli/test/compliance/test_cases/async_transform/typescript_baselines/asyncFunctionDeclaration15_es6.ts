declare let a: any;
declare let obj: {then: string;};
async function fn1() {}  // valid: Promise<void>
async function fn7() {
  return;
}  // valid: Promise<void>
async function fn8() {
  return 1;
}  // valid: Promise<number>
async function fn9() {
  return null;
}  // valid: Promise<any>
async function fn10() {
  return undefined;
}  // valid: Promise<any>
async function fn11() {
  return a;
}  // valid: Promise<any>
async function fn12() {
  return obj;
}  // valid: Promise<{ then: string; }>
async function fn14() {
  await 1;
}  // valid: Promise<void>
async function fn15() {
  await null;
}  // valid: Promise<void>
async function fn16() {
  await undefined;
}  // valid: Promise<void>
async function fn17() {
  await a;
}  // valid: Promise<void>
async function fn18() {
  await obj;
}  // valid: Promise<void>
