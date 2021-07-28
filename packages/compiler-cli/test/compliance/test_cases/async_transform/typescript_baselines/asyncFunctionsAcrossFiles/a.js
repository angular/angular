function* f_generator() {
    yield b.f();
}
import { b } from './b';
export const a = {
    f: () => Zone.__awaiter(this, [], f_generator)
};
