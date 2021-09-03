class A {
    x() { }
    y() { }
}
class B extends A {
    // async method with only call/get on 'super' does not require a binding
    simple() {
        const ɵsuperIndex = name => super[name];
        const ɵsuper = Object.create(null, {
            x: { get: () => super.x },
            y: { get: () => super.y }
        });
        return Zone.__awaiter(this, [], function* simple_generator() {
            // call with property access
            ɵsuper.x.call(this);
            // call additional property.
            ɵsuper.y.call(this);
            // call with element access
            ɵsuperIndex('x').call(this);
            // property access (read)
            const a = ɵsuper.x;
            // element access (read)
            const b = ɵsuperIndex('x');
        });
    }
    // async method with assignment/destructuring on 'super' requires a binding
    advanced() {
        const ɵsuperIndex_1 = (function (geti, seti) {
          const cache = Object.create(null);
          return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });
        })(name => super[name], (name, value) => super[name] = value);
        const ɵsuper_1 = Object.create(null, {
            x: { get: () => super.x, set: v => super.x = v }
        });
        return Zone.__awaiter(this, [], function* advanced_generator() {
            const f = () => { };
            // call with property access
            ɵsuper_1.x.call(this);
            // call with element access
            ɵsuperIndex_1('x').value.call(this);
            // property access (read)
            const a = ɵsuper_1.x;
            // element access (read)
            const b = ɵsuperIndex_1('x').value;
            // property access (assign)
            ɵsuper_1.x = f;
            // element access (assign)
            ɵsuperIndex_1('x').value = f;
            // destructuring assign with property access
            ({ f: ɵsuper_1.x } = { f });
            // destructuring assign with element access
            ({ f: ɵsuperIndex_1('x').value } = { f });
            // property access in arrow
            (() => ɵsuper_1.x.call(this));
            // element access in arrow
            (() => ɵsuperIndex_1('x').value.call(this));
            // property access in async arrow
            (() => Zone.__awaiter(this, [], function* anonymous_generator() { return ɵsuper_1.x.call(this); }));
            // element access in async arrow
            (() => Zone.__awaiter(this, [], function* anonymous_generator_1() { return ɵsuperIndex_1('x').value.call(this); }));
        });
    }
    property_access_only_read_only() {
        const ɵsuper_2 = Object.create(null, {
            x: { get: () => super.x }
        });
        return Zone.__awaiter(this, [], function* property_access_only_read_only_generator() {
            // call with property access
            ɵsuper_2.x.call(this);
            // property access (read)
            const a = ɵsuper_2.x;
            // property access in arrow
            (() => ɵsuper_2.x.call(this));
            // property access in async arrow
            (() => Zone.__awaiter(this, [], function* anonymous_generator_2() { return ɵsuper_2.x.call(this); }));
        });
    }
    property_access_only_write_only() {
        const ɵsuper_3 = Object.create(null, {
            x: { get: () => super.x, set: v => super.x = v }
        });
        return Zone.__awaiter(this, [], function* property_access_only_write_only_generator() {
            const f = () => { };
            // property access (assign)
            ɵsuper_3.x = f;
            // destructuring assign with property access
            ({ f: ɵsuper_3.x } = { f });
            // property access (assign) in arrow
            (() => ɵsuper_3.x = f);
            // property access (assign) in async arrow
            (() => Zone.__awaiter(this, [], function* anonymous_generator_3() { return ɵsuper_3.x = f; }));
        });
    }
    element_access_only_read_only() {
        const ɵsuperIndex_2 = name => super[name];
        return Zone.__awaiter(this, [], function* element_access_only_read_only_generator() {
            // call with element access
            ɵsuperIndex_2('x').call(this);
            // element access (read)
            const a = ɵsuperIndex_2('x');
            // element access in arrow
            (() => ɵsuperIndex_2('x').call(this));
            // element access in async arrow
            (() => Zone.__awaiter(this, [], function* anonymous_generator_4() { return ɵsuperIndex_2('x').call(this); }));
        });
    }
    element_access_only_write_only() {
        const ɵsuperIndex_3 = (function (geti, seti) {
          const cache = Object.create(null);
          return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });
        })(name => super[name], (name, value) => super[name] = value);
        return Zone.__awaiter(this, [], function* element_access_only_write_only_generator() {
            const f = () => { };
            // element access (assign)
            ɵsuperIndex_3('x').value = f;
            // destructuring assign with element access
            ({ f: ɵsuperIndex_3('x').value } = { f });
            // element access (assign) in arrow
            (() => ɵsuperIndex_3('x').value = f);
            // element access (assign) in async arrow
            (() => Zone.__awaiter(this, [], function* anonymous_generator_5() { return ɵsuperIndex_3('x').value = f; }));
        });
    }
}
