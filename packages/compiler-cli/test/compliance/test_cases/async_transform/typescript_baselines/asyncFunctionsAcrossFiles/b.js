function* f_generator() {
    yield a.f();
}
import { a } from './a';
export const b = {
    f: () => Zone.__awaiter(this, [], f_generator)
};
