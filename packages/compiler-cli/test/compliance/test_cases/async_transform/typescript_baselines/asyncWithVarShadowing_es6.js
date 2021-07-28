function* fn1_generator(x) {
    var x;
}
function* fn2_generator(x) {
    var x, z;
}
function* fn3_generator(x) {
    var z;
}
function* fn4_generator(x) {
    var x = y;
}
function* fn5_generator(x) {
    var { x } = y;
}
function* fn6_generator(x) {
    var { x, z } = y;
}
function* fn7_generator(x) {
    var { x = y } = y;
}
function* fn8_generator(x) {
    var { z: x } = y;
}
function* fn9_generator(x) {
    var { z: { x } } = y;
}
function* fn10_generator(x) {
    var { z: { x } = y } = y;
}
function* fn11_generator(x) {
    var x = __rest(y, []);
}
function* fn12_generator(x) {
    var [x] = y;
}
function* fn13_generator(x) {
    var [x = y] = y;
}
function* fn14_generator(x) {
    var [, x] = y;
}
function* fn15_generator(x) {
    var [...x] = y;
}
function* fn16_generator(x) {
    var [[x]] = y;
}
function* fn17_generator(x) {
    var [[x] = y] = y;
}
function* fn18_generator({ x }) {
    var x;
}
function* fn19_generator([x]) {
    var x;
}
function* fn20_generator(x) {
    {
        var x;
    }
}
function* fn21_generator(x) {
    if (y) {
        var x;
    }
}
function* fn22_generator(x) {
    if (y) {
    }
    else {
        var x;
    }
}
function* fn23_generator(x) {
    try {
        var x;
    }
    catch (e) {
    }
}
function* fn24_generator(x) {
    try {
    }
    catch (e) {
        var x;
    }
}
function* fn25_generator(x) {
    try {
    }
    catch (x) {
        var x;
    }
}
function* fn26_generator(x) {
    try {
    }
    catch ({ x }) {
        var x;
    }
}
function* fn27_generator(x) {
    try {
    }
    finally {
        var x;
    }
}
function* fn28_generator(x) {
    while (y) {
        var x;
    }
}
function* fn29_generator(x) {
    do {
        var x;
    } while (y);
}
function* fn30_generator(x) {
    for (var x = y;;) {
    }
}
function* fn31_generator(x) {
    for (var { x } = y;;) {
    }
}
function* fn32_generator(x) {
    for (;;) {
        var x;
    }
}
function* fn33_generator(x) {
    for (var x in y) {
    }
}
function* fn34_generator(x) {
    for (var z in y) {
        var x;
    }
}
function* fn35_generator(x) {
    for (var x of y) {
    }
}
function* fn36_generator(x) {
    for (var { x } of y) {
    }
}
function* fn37_generator(x) {
    for (var z of y) {
        var x;
    }
}
function* fn38_generator(x) {
    switch (y) {
        case y:
            var x;
    }
}
function* fn39_generator(x) {
    foo: {
        var x;
        break foo;
    }
}
function* fn40_generator(x) {
    try {
    }
    catch (_a) {
        var x;
    }
}
function fn1(x) {
    return Zone.__awaiter(this, [x], fn1_generator);
}
function fn2(x) {
    return Zone.__awaiter(this, [x], fn2_generator);
}
function fn3(x) {
    return Zone.__awaiter(this, [x], fn3_generator);
}
function fn4(x) {
    return Zone.__awaiter(this, [x], fn4_generator);
}
function fn5(x) {
    return Zone.__awaiter(this, [x], fn5_generator);
}
function fn6(x) {
    return Zone.__awaiter(this, [x], fn6_generator);
}
function fn7(x) {
    return Zone.__awaiter(this, [x], fn7_generator);
}
function fn8(x) {
    return Zone.__awaiter(this, [x], fn8_generator);
}
function fn9(x) {
    return Zone.__awaiter(this, [x], fn9_generator);
}
function fn10(x) {
    return Zone.__awaiter(this, [x], fn10_generator);
}
function fn11(x) {
    return Zone.__awaiter(this, [x], fn11_generator);
}
function fn12(x) {
    return Zone.__awaiter(this, [x], fn12_generator);
}
function fn13(x) {
    return Zone.__awaiter(this, [x], fn13_generator);
}
function fn14(x) {
    return Zone.__awaiter(this, [x], fn14_generator);
}
function fn15(x) {
    return Zone.__awaiter(this, [x], fn15_generator);
}
function fn16(x) {
    return Zone.__awaiter(this, [x], fn16_generator);
}
function fn17(x) {
    return Zone.__awaiter(this, [x], fn17_generator);
}
function fn18({ x }) {
    return Zone.__awaiter(this, [{ x }], fn18_generator);
}
function fn19([x]) {
    return Zone.__awaiter(this, [[x]], fn19_generator);
}
function fn20(x) {
    return Zone.__awaiter(this, [x], fn20_generator);
}
function fn21(x) {
    return Zone.__awaiter(this, [x], fn21_generator);
}
function fn22(x) {
    return Zone.__awaiter(this, [x], fn22_generator);
}
function fn23(x) {
    return Zone.__awaiter(this, [x], fn23_generator);
}
function fn24(x) {
    return Zone.__awaiter(this, [x], fn24_generator);
}
function fn25(x) {
    return Zone.__awaiter(this, [x], fn25_generator);
}
function fn26(x) {
    return Zone.__awaiter(this, [x], fn26_generator);
}
function fn27(x) {
    return Zone.__awaiter(this, [x], fn27_generator);
}
function fn28(x) {
    return Zone.__awaiter(this, [x], fn28_generator);
}
function fn29(x) {
    return Zone.__awaiter(this, [x], fn29_generator);
}
function fn30(x) {
    return Zone.__awaiter(this, [x], fn30_generator);
}
function fn31(x) {
    return Zone.__awaiter(this, [x], fn31_generator);
}
function fn32(x) {
    return Zone.__awaiter(this, [x], fn32_generator);
}
function fn33(x) {
    return Zone.__awaiter(this, [x], fn33_generator);
}
function fn34(x) {
    return Zone.__awaiter(this, [x], fn34_generator);
}
function fn35(x) {
    return Zone.__awaiter(this, [x], fn35_generator);
}
function fn36(x) {
    return Zone.__awaiter(this, [x], fn36_generator);
}
function fn37(x) {
    return Zone.__awaiter(this, [x], fn37_generator);
}
function fn38(x) {
    return Zone.__awaiter(this, [x], fn38_generator);
}
function fn39(x) {
    return Zone.__awaiter(this, [x], fn39_generator);
}
function fn40(x) {
    return Zone.__awaiter(this, [x], fn40_generator);
}