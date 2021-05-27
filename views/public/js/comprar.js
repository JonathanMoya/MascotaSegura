var socket = io.connect('/');

socket.on('conection', function (data) {
});

function enviarCorreo() {
    var nombre = $('#nombre');
    var email = $('#email');
    var mensaje = $('#mensaje');
    var contador = 0;
    if (nombre.val() === "") {
        contador++;
        nombre.removeClass("is-valid");
        nombre.addClass("is-invalid");
    } else {
        nombre.removeClass("is-invalid");
        nombre.addClass("is-valid");
    }

    if (email.val() === "") {
        contador++;
        email.removeClass("is-valid");
        email.addClass("is-invalid");
    } else {
        var emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
        if (emailRegex.test(email.val())) {
            email.removeClass("is-invalid");
            email.addClass("is-valid");
            console.log('entra');
        } else {
            contador++;
            email.removeClass("is-valid");
            email.addClass("is-invalid");
        }
    }

    if (mensaje.val() === "") {
        contador++;
        mensaje.removeClass("is-valid");
        mensaje.addClass("is-invalid");
    } else {
        mensaje.removeClass("is-invalid");
        mensaje.addClass("is-valid");
    }
    if (contador === 0) {
        var jsonSend = {nombre: nombre.val(), email: email.val(), mensaje: mensaje.val()};
        socket.emit('correoEnviarCompra', jsonSend)
    }
}
socket.on('correoRespuestaCompra', function (response) {
    var nombre = $('#nombre');
    var email = $('#email');
    var mensaje = $('#mensaje');
    if(response==="bien"){
        $("#bien").fadeToggle();$("#bien").delay(1500).fadeToggle();
        nombre.val('');
        email.val('');
        telefono.val('');
        mensaje.val('');
    }else if(response==="mal"){
        $("#mal").fadeToggle();$("#mal").delay(1500).fadeToggle();
    }else{

    }
})
