function obtenerValorCedula() {
		var cedula = document.getElementById('cedula').value;
		if(cedula) {
			cedula = cedula.trim();
		}
		return cedula;
}
//function obtenerValorVeces() {
//	return cedula = document.getElementById('veces').value;
//}
function cadenaNumeros(cadena){
	return cadena.split('').map(function(item) {
		return parseInt(item, 10);
	});
}

function fijarTextoLabel(texto, labelId) {
	document.getElementById(labelId).textContent=texto;
}

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

function obtenerInputArchivo() {
	return document.getElementById('input-archivo');
}

function limpiarInputArchivo() {
	document.getElementById('input-archivo').value="";
}
function obtenerArchivo() {
	var file = null;
	if (obtenerInputArchivo().files && obtenerInputArchivo().files.length > 0) {
		file = obtenerInputArchivo().files[0];
	}
	return file;
}

async function cargarPersonasArchivo() {
	var file = obtenerArchivo();
	var label = document.getElementById('label-carga');
		
	if (file) {
		label.textContent = "Procesando";
		var i = await contar();			
		Papa.parse(file, {
			worker: true,
			step: async function(row) {
				console.log("Row:"+i);
				//se asume que esta bien cada tupla
				if(row.data.length>2) {
					i++;
					var persona = {};
					persona.id=i;
					persona.nombres=row.data[0];
					persona.identificacion=row.data[1];
					persona.fechaNacimiento=row.data[2];
					console.log("insertando id:"+i);
					label.textContent = "insertando id:"+i;																		
					insertSkipValidation(persona);
										
				}
				
			},
			complete: function() {
				console.log("Reading done!");		
				limpiarInputArchivo();
			}
		});
	}

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
				dataType: "string"
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

async function insert(value) {
	var insertCount = await connection.insert({
		into: table,
		validation:false,
		values: [value]
	});

	//console.log(`${insertCount} rows inserted`);
	return insertCount;
}

async function insertSkipValidation(value) {
	var insertCount = await connection.insert({
		into: table,
		values: [value],
		validation:false,
		skipDataCheck:true
	});

	//console.log(`${insertCount} rows inserted`);
	return insertCount;
}


async function selectAll() {
	var results = await connection.select({
		from: table,
		order: {
			by: "id",
			type: "desc"
		},
		limit: 30 
	});
	return results;
}

async function contar() {
	var results = await connection.count({
		from: table
	});
	return results;
}

async function deleteAll() {
	var rowsDeleted = await connection.remove({
		from: 'Product'
	});
	console.log(rowsDeleted + ' record deleted');
	return rowsDeleted;
}

async function registrar() {
	var persona = {};
    var id = await contar();
    id++;
    persona.id = id;
	persona.nombres = document.getElementById('nombres').value;
	persona.identificacion = document.getElementById('identificacion').value;
	persona.fechaNacimiento = document.getElementById('fechaNacimiento').value;
	await insert(persona);
	mostrarPersonas();
	limpiar();

}

async function mostrarPersonas() {
	var personas = await selectAll();
	var contador = await contar();
	var contadorLabel = document.getElementById('contador');
	contadorLabel.textContent="Total registrado:"+contador+" registros";
	var personasDiv = document.getElementById('personas');
	removeAllChildNodes(personasDiv);
	for (let i = 0; i < personas.length; i++) {
		var personaExistente = personas[i];
		var templatePersonas = document.getElementById('template-personas');
		var clonedTemplatePersonas = templatePersonas.content.cloneNode(true);
		clonedTemplatePersonas.querySelector(".id").textContent = personaExistente.id;
		clonedTemplatePersonas.querySelector(".nombres").textContent = personaExistente.nombres;
		clonedTemplatePersonas.querySelector(".identificacion").textContent = personaExistente.identificacion;
		clonedTemplatePersonas.querySelector(".fechaNacimiento").textContent = personaExistente.fechaNacimiento;
		personasDiv.insertBefore(clonedTemplatePersonas, personasDiv.firstChild);
	}
}

function removeAllChildNodes(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

function limpiar() {
	document.getElementById('nombres').value = "";
	document.getElementById('identificacion').value = "";
	document.getElementById('fechaNacimiento').value = "";
}

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
	await mostrarPersonas();
	document.getElementById("refrescar").onclick=async ()=>{
            await mostrarPersonas();
    };
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

