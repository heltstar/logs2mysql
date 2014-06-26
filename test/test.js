
var lib = require("./lib.js");


console.log(lib.num);
console.log(lib.a);
console.log(lib.add());
function f()
{
    console.log(lib.add());
}
setTimeout(f,1000);
