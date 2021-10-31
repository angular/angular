/* eslint-disable no-unused-vars */
export class TestClass {
    method1(
        /** description of param1 */ param1: number,
        /** description of param2 */ param2?: string,
        /** description of param3 */ param3: unknown = {},
        /** description of param4 */ param4 = 'default string',
        ) {
        ///
    }

    /**
     * Some description of method 2
     *
     * @param param5 description of param5
     * @param param6 description of param6
     * @param param7 description of param7
     */
    method2(param5: string, param6: number, param7 = 42) {
        //
    }
}
