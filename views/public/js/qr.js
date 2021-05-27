var qrcode = new QRCode("qrcode");
var json;

function obtenerQRCaja() {
    for (var i = 0; i < lista.length; i++) {
        (function (i) {
            setTimeout(function () {
                let caja = 'https://mascotasegura.co/mascota/admin?id=' + lista[i].id + "&pass=" + lista[i].pass;
                let array = [caja, lista[i].num, 'caja'];
                console.log(array);
                download(array);
            }, 500 * i);
        })(i);
    }
}

function obtenerQRUnico(data) {
    console.log(data);
    let caja = 'https://mascotasegura.co/mascota/admin?id=' + data.id + "&pass=" + data.pass;
    let array = [caja, data.num, 'caja'];
    download(array);
    setTimeout(function () {
        let llavero = 'https://mascotasegura.co/mascota/admin?id=' + data.id;
        let array1 = [llavero, data.num, 'llavero'];
        download(array1);
    });
}

function obtenerQRLlavero() {
    for (var i = 0; i < lista.length; i++) {
        (function (i) {
            setTimeout(function () {
                let llavero = 'https://mascotasegura.co/mascota/admin?id=' + lista[i].id;
                let array = [llavero, lista[i].num, 'llavero'];
                console.log(array);
                download(array);
            }, 500 * i);
        })(i);
    }
}

var lista;

socket.on('lista', function (data) {
    lista = data;
});

socket.on('listaCompleta', function (data) {
    for (var i = 0; i < data.length; i++) {
        (function (i) {
            setTimeout(function () {
                let caja = 'https://mascotasegura.co/mascota/admin?id=' + data[i].id + "&pass=" + data[i].pass;
            }, 500 * i);
        })(i);
    }
});


function subir() {
    json = $('#comment').val();
    socket.emit('uploadJSON', json);
}

socket.on('uploadJSON', function (respuesta) {
    console.log(respuesta);
});

function makeCode(text) {
    qrcode.makeCode(text);
}

function obtenerImagen() {
    var imgs = $('#qrcode').children('img').map(function () {
        return $(this).attr('src')
    }).get();
    return imgs;
}

function download(array) {
    console.log(array[2] + array[1]);
    makeCode(array[0]);
    setTimeout(function () {
        let a = document.createElement('a');
        a.href = obtenerImagen();
        a.download = array[2] + " " + array[1];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, 100);
}
