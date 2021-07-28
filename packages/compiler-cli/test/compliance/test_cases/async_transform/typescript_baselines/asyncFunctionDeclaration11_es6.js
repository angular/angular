function* await_generator() {
}
function await() {
    return Zone.__awaiter(this, [], await_generator);
}
