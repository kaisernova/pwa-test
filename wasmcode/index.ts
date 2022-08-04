// The entry file of your WebAssembly module.

export function validarCedula(digitos: Array<i32>) :i32{
	var valido = 0;
    var codigo_provincia = digitos[0] * 10 + digitos[1];

    //if (codigo_provincia >= 1 && (codigo_provincia <= 24 || codigo_provincia == 30) && digitos[2] < 6) {

    if (codigo_provincia >= 1 && (codigo_provincia <= 24 || codigo_provincia == 30)) {
        var digito_verificador = digitos.pop();

        var digito_calculado = digitos.reduce(
                function (valorPrevio, valorActual, indice) {
                return valorPrevio - (valorActual * (2 - indice % 2)) % 9 - (valorActual == 9) * 9;
            }, 1000) % 10;
		if(digito_calculado === digito_verificador) {
			valido=1;
		}			
        
    }

    return valido;
}