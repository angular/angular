/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;

function plural(val: number): number {
const n = val;

if (n === 1 || n === 11)
    return 1;
if (n === 2 || n === 12)
    return 2;
if (n === Math.floor(n) && (n >= 3 && n <= 10 || n >= 13 && n <= 19))
    return 3;
return 5;
}

export default ["gd",[["m","f"]],u,[["D","L","M","C","A","H","S"],["DiD","DiL","DiM","DiC","Dia","Dih","DiS"],["DiDòmhnaich","DiLuain","DiMàirt","DiCiadain","DiarDaoin","DihAoine","DiSathairne"],["Dò","Lu","Mà","Ci","Da","hA","Sa"]],u,[["F","G","M","G","C","Ò","I","L","S","D","S","D"],["Faoi","Gearr","Màrt","Gibl","Cèit","Ògmh","Iuch","Lùna","Sult","Dàmh","Samh","Dùbh"],["dhen Fhaoilleach","dhen Ghearran","dhen Mhàrt","dhen Ghiblean","dhen Chèitean","dhen Ògmhios","dhen Iuchar","dhen Lùnastal","dhen t-Sultain","dhen Dàmhair","dhen t-Samhain","dhen Dùbhlachd"]],[["F","G","M","G","C","Ò","I","L","S","D","S","D"],["Faoi","Gearr","Màrt","Gibl","Cèit","Ògmh","Iuch","Lùna","Sult","Dàmh","Samh","Dùbh"],["Am Faoilleach","An Gearran","Am Màrt","An Giblean","An Cèitean","An t-Ògmhios","An t-Iuchar","An Lùnastal","An t-Sultain","An Dàmhair","An t-Samhain","An Dùbhlachd"]],[["R","A"],["RC","AD"],["Ro Chrìosta","An dèidh Chrìosta"]],1,[6,0],["dd/MM/y","d MMM y","d'mh' MMMM y","EEEE, d'mh' MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"GBP","£","Punnd Sasannach",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RON":[u,"leu"],"RUR":[u,"р."],"THB":["฿"],"TWD":["NT$"],"XXX":[]},"ltr", plural];
