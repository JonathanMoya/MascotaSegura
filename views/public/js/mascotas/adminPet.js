var socket = io.connect('/');

function perdidaMascota(id, pass) {
    var datos = $('#datosPerdida').val();
    socket.emit('mascota/perdidaAdmin', {id:id, pass:pass, datos:datos});
}

function apareceMascota(id, pass){
    socket.emit('mascota/apareceAdmin', {id:id, pass:pass});
}

function enviarResena(){
    var datos = $('#Resena').val();
    console.log(datos);
    if(datos===''){

    }else{
        socket.emit('correoEnviar', {departamento:"Servicio al cliente", email:'Reseña', mensaje:datos, telefono:""});
    }
}


socket.on('mascotaPerdida', function (data) {
    $('#cerrarDiv').click();
    if(data.nModified===1){
        $('.perdido').hide();
        $('.aparecido').show();
        location.reload();
    }else{
        console.log('No va a entrar');
    }
});

socket.on('mascotaAparece', function (data) {
    $('#ComentariosButton').click();
    $('#cerrarDiv2').click();
    if(data.nModified===1){
        $('.perdido').show();
        $('.aparecido').hide();
    }else{
        console.log('No va a entrar');
    }
});
