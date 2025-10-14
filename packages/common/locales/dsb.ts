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
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && i % 100 === 1 || f % 100 === 1)
    return 1;
if (v === 0 && i % 100 === 2 || f % 100 === 2)
    return 2;
if (v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 3 && i % 100 <= 4)) || f % 100 === Math.floor(f % 100) && (f % 100 >= 3 && f % 100 <= 4))
    return 3;
return 5;
}

export default ["dsb",[["dop.","wótp."],["dopołdnja","wótpołdnja"]],[["am","pm"],u,["dopołdnja","wótpołdnja"]],[["n","p","w","s","s","p","s"],["nje","pón","wał","srj","stw","pět","sob"],["njeźela","pónjeźele","wałtora","srjoda","stwórtk","pětk","sobota"],["nj","pó","wa","sr","st","pě","so"]],u,[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan.","feb.","měr.","apr.","maj.","jun.","jul.","awg.","sep.","okt.","now.","dec."],["januara","februara","měrca","apryla","maja","junija","julija","awgusta","septembra","oktobra","nowembra","decembra"]],[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","měr","apr","maj","jun","jul","awg","sep","okt","now","dec"],["januar","februar","měrc","apryl","maj","junij","julij","awgust","september","oktober","nowember","december"]],[["pś.Chr.n.","pó Chr.n."],u,["pśed Kristusowym naroźenim","pó Kristusowem naroźenju"]],1,[6,0],["d.M.yy","d.M.y","d. MMMM y","EEEE, d. MMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","·","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":[u,"$"],"PLN":["zł"],"THB":["฿"]},"ltr", plural];
