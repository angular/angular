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

if (n === 1)
    return 1;
if (n === 2)
    return 2;
if (n === Math.floor(n) && (n >= 3 && n <= 6))
    return 3;
if (n === Math.floor(n) && (n >= 7 && n <= 10))
    return 4;
return 5;
}

export default ["ga-GB",[["r.n.","i.n."]],u,[["D","L","M","C","D","A","S"],["Domh","Luan","Máirt","Céad","Déar","Aoine","Sath"],["Dé Domhnaigh","Dé Luain","Dé Máirt","Dé Céadaoin","Déardaoin","Dé hAoine","Dé Sathairn"],["Do","Lu","Má","Cé","Dé","Ao","Sa"]],u,[["E","F","M","A","B","M","I","L","M","D","S","N"],["Ean","Feabh","Márta","Aib","Beal","Meith","Iúil","Lún","MFómh","DFómh","Samh","Noll"],["Eanáir","Feabhra","Márta","Aibreán","Bealtaine","Meitheamh","Iúil","Lúnasa","Meán Fómhair","Deireadh Fómhair","Samhain","Nollaig"]],u,[["RC","AD"],u,["Roimh Chríost","Anno Domini"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","Nuimh",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"GBP","£","Punt Steirling",{"RUR":[u,"р."],"THB":["฿"],"TWD":["NT$"],"XXX":[]},"ltr", plural];
