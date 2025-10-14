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

if (n % 10 === 1 && !(n % 100 === 11 || (n % 100 === 71 || n % 100 === 91)))
    return 1;
if (n % 10 === 2 && !(n % 100 === 12 || (n % 100 === 72 || n % 100 === 92)))
    return 2;
if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) && !(n % 100 >= 10 && n % 100 <= 19 || (n % 100 >= 70 && n % 100 <= 79 || n % 100 >= 90 && n % 100 <= 99)))
    return 3;
if (!(n === 0) && n % 1000000 === 0)
    return 4;
return 5;
}

export default ["br",[["am","gm"],["A.M.","G.M."]],[["A.M.","G.M."]],[["Su","L","Mz","Mc","Y","G","Sa"],["Sul","Lun","Meu.","Mer.","Yaou","Gwe.","Sad."],["Sul","Lun","Meurzh","Mercʼher","Yaou","Gwener","Sadorn"],["Sul","Lun","Meu.","Mer.","Yaou","Gwe.","Sad."]],u,[["01","02","03","04","05","06","07","08","09","10","11","12"],["Gen.","Cʼhwe.","Meur.","Ebr.","Mae","Mezh.","Goue.","Eost","Gwen.","Here","Du","Kzu."],["Genver","Cʼhwevrer","Meurzh","Ebrel","Mae","Mezheven","Gouere","Eost","Gwengolo","Here","Du","Kerzu"]],u,[["a-raok J.K.","goude J.K."],u,["a-raok Jezuz-Krist","goude Jezuz-Krist"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}","{1}, {0}","{1} 'da' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":["$A","$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":["$CA","$"],"CNY":[u,"¥"],"EGP":[u,"£ E"],"GBP":["£ RU","£"],"HKD":["$ HK","$"],"ILS":[u,"₪"],"JPY":[u,"¥"],"KRW":[u,"₩"],"LBP":[u,"£L"],"NZD":["$ ZN","$"],"PHP":[u,"₱"],"RUR":[u,"р."],"TOP":[u,"$ T"],"TWD":[u,"$"],"USD":["$ SU","$"],"VND":[u,"₫"],"XCD":[u,"$"],"XXX":[]},"ltr", plural];
