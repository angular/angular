function* fAsync_generator() {
    // Without explicit type annotation, this is just an array.
    return [1, true];
}
function* fAsyncExplicit_generator() {
    // This is contextually typed as a tuple.
    return [1, true];
}
function* fIndexedTypeForStringProp_generator(obj) {
    return obj.stringProp;
}
function* fIndexedTypeForPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fIndexedTypeForExplicitPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fIndexedTypeForAnyProp_generator(obj) {
    return obj.anyProp;
}
function* fIndexedTypeForPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fIndexedTypeForExplicitPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fGenericIndexedTypeForStringProp_generator(obj) {
    return obj.stringProp;
}
function* fGenericIndexedTypeForPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fGenericIndexedTypeForExplicitPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fGenericIndexedTypeForAnyProp_generator(obj) {
    return obj.anyProp;
}
function* fGenericIndexedTypeForPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fGenericIndexedTypeForExplicitPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fGenericIndexedTypeForKProp_generator(obj, key) {
    return obj[key];
}
function* fGenericIndexedTypeForPromiseOfKProp_generator(obj, key) {
    return Promise.resolve(obj[key]);
}
function* fGenericIndexedTypeForExplicitPromiseOfKProp_generator(obj, key) {
    return Promise.resolve(obj[key]);
}

function fAsync() {
    return Zone.__awaiter(this, [], fAsync_generator);
}
function fAsyncExplicit() {
    return Zone.__awaiter(this, [], fAsyncExplicit_generator);
}
function fIndexedTypeForStringProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForStringProp_generator);
}
function fIndexedTypeForPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForPromiseOfStringProp_generator);
}
function fIndexedTypeForExplicitPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForExplicitPromiseOfStringProp_generator);
}
function fIndexedTypeForAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForAnyProp_generator);
}
function fIndexedTypeForPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForPromiseOfAnyProp_generator);
}
function fIndexedTypeForExplicitPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForExplicitPromiseOfAnyProp_generator);
}
function fGenericIndexedTypeForStringProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForStringProp_generator);
}
function fGenericIndexedTypeForPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForPromiseOfStringProp_generator);
}
function fGenericIndexedTypeForExplicitPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForExplicitPromiseOfStringProp_generator);
}
function fGenericIndexedTypeForAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForAnyProp_generator);
}
function fGenericIndexedTypeForPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForPromiseOfAnyProp_generator);
}
function fGenericIndexedTypeForExplicitPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForExplicitPromiseOfAnyProp_generator);
}
function fGenericIndexedTypeForKProp(obj, key) {
    return Zone.__awaiter(this, [obj, key], fGenericIndexedTypeForKProp_generator);
}
function fGenericIndexedTypeForPromiseOfKProp(obj, key) {
    return Zone.__awaiter(this, [obj, key], fGenericIndexedTypeForPromiseOfKProp_generator);
}
function fGenericIndexedTypeForExplicitPromiseOfKProp(obj, key) {
    return Zone.__awaiter(this, [obj, key], fGenericIndexedTypeForExplicitPromiseOfKProp_generator);
}
