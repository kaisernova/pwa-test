onmessage = function(e) {
   doSomething(e.data);
};

function doSomething(param) {
	console.log(param);
    postMessage('done:'+JSON.stringify(param));
}