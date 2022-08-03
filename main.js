// Side navigation
function w3_open() {
	var x = document.getElementById("mySidebar");
	x.style.width = "100%";
	x.style.fontSize = "40px";
	x.style.paddingTop = "10%";
	x.style.display = "block";
}
function w3_close() {
	document.getElementById("mySidebar").style.display = "none";
}

function acordeon(id) {
	var x = document.getElementById(id);
	if (x.className.indexOf("w3-show") == -1) {
		x.className += " w3-show";
	} else {
		x.className = x.className.replace(" w3-show", "");
	}
}

function handleConnection() {
	var titleElement = document.getElementById('status-title');
	if (navigator.onLine) {
		isReachable(getServerUrl()).then(function(online) {
			if (online) {
				titleElement.textContent = "IRS ONLINE :)";
				console.log('online');
			} else {
				titleElement.textContent = "IRS NO CONNECTION";
				console.log('no connectivity');
			}
		});
	} else {
		// handle offline status
		titleElement.textContent = "***IRS OFFLINE NOW***";
		console.log('offline');
	}
}

function isReachable(url) {
	/**
	 * Note: fetch() still "succeeds" for 404s on subdirectories,
	 * which is ok when only testing for domain reachability.
	 *
	 * Example:
	 *   https://google.com/noexist does not throw
	 *   https://noexist.com/noexist does throw
	 */
	return fetch(url, { method: 'HEAD', mode: 'no-cors' })
		.then(function(resp) {
			return resp && (resp.ok || resp.type === 'opaque');
		})
		.catch(function(err) {
			console.warn('[conn test failure]:', err);
		});
}

function getServerUrl() {
	//window.location.origin
	return window.location.origin;
}

//**************************************** */
var connection = new JsStore.Connection(new Worker('jsstore.worker.min.js'));
var dbName = 'irs_db';
var table = 'persona';
async function initDb() {
	var tblPersona = {
		name: table,
		columns: {
			// Here "Id" is name of column
			id: {
				primaryKey: true,
				autoIncrement: true
			},
			nombres: {
				notNull: true,
				dataType: "string"
			},
			identificacion: {
				notNull: true,
				dataType: "string"
			},
			fechaNacimiento: {
				notNull: true,
				dataType: "date_time"
			},
			activo: {
				notNull: true,
				dataType: "boolean"
			}
		}
	};
	var database = {
		name: dbName,
		tables: [tblPersona]
	}
	const isDbCreated = await connection.initDb(database);
	if (isDbCreated === true) {
		console.log("db created");
		// here you can prefill database with some data
	} else {
		console.log("db opened");
	}
}



/*
async function execDb() {

	var value = {
		itemName: 'Blue Jeans',
		price: 2000,
		quantity: 1000
	}

	var insertCount = await connection.insert({
		into: 'Product',
		values: [value]
	});

	console.log(`${insertCount} rows inserted`);
	// results will be array of objects
	var results = await connection.select({
		from: 'Product',
		where: {
			price: 2000
		}
	});

	console.log(results.length + 'record found');
	console.log(JSON.stringify(results));

	var rowsUpdated = await connection.update({
		in: 'Product',
		where: {
			itemName: {
				like: '%black%'
			}
		},
		set: {
			quantity: 2000
		}
	});
	console.log(rowsUpdated + ' rows updated');
	var rowsDeleted = await connection.remove({
		from: 'Product',
		where: {
			price: 2000
		}
	});
	console.log(rowsDeleted + ' record deleted');

}
*/

//**************************************** */



window.onload = async () => {
	'use strict';
	/*
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('./sw.js', {
	type: 'module',
  });
	}*/
	console.log("handles");
	window.addEventListener('online', handleConnection);
	window.addEventListener('offline', handleConnection);
	handleConnection();
	await initDb();
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
	deferredPrompt = e;
});


const installApp = document.getElementById('installApp');

installApp.addEventListener('click', async () => {
	if (deferredPrompt !== null) {
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			deferredPrompt = null;
		}
	}
});

