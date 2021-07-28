function* x_generator(i) { return yield someOtherFunction(i); }
function* x1_generator(i) { return yield someOtherFunction(i); }
const x = (i) => Zone.__awaiter(this, [i], x_generator);
const x1 = (i) => Zone.__awaiter(this, [i], x1_generator);
