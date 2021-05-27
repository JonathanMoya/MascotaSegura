// var socket = io.connect('mascotasegura.co');
const socket = io.connect('/admin');

//Mensaje que recive del servidor para actualizar la lista actual.
socket.on('lista', function (data) {
    console.log(data);
    putLista(data);
});

var contador = {
    perdida: 0,
    nuncaPerdida: 0,
    aparece: 0,
    registrado: 0,
    noRegistrado:0,
};

socket.emit('listaCompleta');

socket.on('listaCompleta', function (data) {
    data.forEach(function (element) {
        if (element.perdida == true) {
            contador.perdida++;
        } else {
            if (element.hasOwnProperty('perdidaAnytime')) {
                contador.aparece++;
            } else {
                contador.nuncaPerdida++;
            }
        }
        if(element.name === undefined) {
            contador.noRegistrado++;
        }else{
            contador.registrado++;
        }
    });
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    google.charts.setOnLoadCallback(drawChart2);

    function drawChart() {
    console.log('1');
        var data = google.visualization.arrayToDataTable([
            ['Perdidas', 'Cantidad de mascota'],
            ['Perdidas', contador.perdida],
            ['Alguna vez perdida', contador.aparece],
            ['Nunca perdida', contador.nuncaPerdida]
        ]);

        var options = {
            title: 'Mascotas perdidas',
            pieHole: 0.4,
            slices: {  1: {offset: 0.5},
                2: {offset: 0.3},
                3: {offset: 0.4},
            },
            colors: ['#ff1810', '#46ff12','#22c2f7']
        };

        let chart = new google.visualization.PieChart(document.getElementById('mascotasPerdidas'));

        chart.draw(data, options);
    }

    function drawChart2() {
        console.log('2');
        var data = google.visualization.arrayToDataTable([
            ['Registro de mascotas', 'Cantidad de mascota'],
            ['Registrada', contador.registrado],
            ['No registrada', contador.noRegistrado],
        ]);

        var options = {
            title: 'Mascotas perdidas',
            pieHole: 0.4,
            slices: {  1: {offset: 0.5},
                2: {offset: 0.3},
                3: {offset: 0.4},
            },
            colors: ['#36ff16', '#a8a7aa']
        };

        let chart = new google.visualization.PieChart(document.getElementById('mascotasRegistradas'));

        chart.draw(data, options);
    }

    console.log(contador);
});



var lista;

function subir() {
    var nombre = $('.nombre').val();
    var direccion = $('.direccion').val();
    var obj = {id: nombre, pass: direccion};
    var myJSON = JSON.stringify(obj);
    socket.emit('nuevaMascota', JSON.stringify(obj));
}

function putLista(data) {
    lista = data;
    var tabla = document.getElementById("tabla");
    tabla.innerHTML = "";
    var table = "";
    table += "<table class='table'>";
    table += "<thead>";
    table += "<tr>";
    table += "<th scope='col'>Num</th>";
    table += "<th scope='col'>Id</th>";
    table += "<th scope='col'>Pass</th>";
    table += "<th scope='col'>Nombre</th>";
    table += "<th colspan='4' scope='colgroup'>Funciones</th>";
    table += "<tr>";
    table += "</thead>";
    table += "</tbody>";
    console.log(data);
    console.log(data.length);
    data.forEach(function (element) {
        table += "<tr>";

        if (element.name === undefined) {
            table += "<td scope='row' class=\"table-primary\">" + element.num + "</td>";
        } else {
            table += "<td scope='row' class=\"table-success\">" + element.num + "</td>";
        }
        table += "<td scope='row'>" + element.id + "</td>";
        if (element.placaPerdida == true) {
            table += "<td class=\"table-danger\">" + element.pass + "</td>";
        } else {
            table += "<td>" + element.pass + "</td>";
        }
        if (element.hasOwnProperty('perdidaAnytime')) {
        }
        table += "<td>" + element.name + "</td>";
        table += '<td><div class="btn-group btn-group-lg" role="group" aria-label="...">\<button type="button" class="btn btn-outline-info" onclick="ver(\'' + element.id + '\');">Observar</button>';
        table += '<button type="button" class="btn btn-outline-primary" onclick="codigoQRUnit(\'' + element.id + '\');">Código QR</button>';
        if (element.placaPerdida === true) {
            table += '<button type="button" class="btn btn-outline-success" onclick="placaAparece(\'' + element.id + '\');">Placa aparece</button>';
        } else {
            table += '<button type="button" class="btn btn-outline-warning" onclick="placaPerdida(\'' + element.id + '\');">Placa perdida</button>';
        }
        table += '<button type="button" class="btn btn-outline-danger" onclick="eliminar(\'' + element.id + '\');">Eliminar</button></div></td>';
        table += "</tr>";
    });
    table += "</tbody>";
    table += "</table>";
    tabla.innerHTML += table;
};

function placaPerdida(id) {
    if (confirm("Está seguro?")) {
        lista.forEach(function (element) {
            if (element.id === id) {
                socket.emit('placaPerdida', {id: id, pass: element.pass, result: true})
            }
        });
    }
}

function placaAparece(id) {
    if (confirm("Está seguro?")) {
        lista.forEach(function (element) {
            if (element.id === id) {
                socket.emit('placaPerdida', {id: id, pass: element.pass, result: false})
            }
        });
    }
}

function ver(data) {
    var text = "";
    lista.forEach(function (element) {
        if (element.id === data) {
            text += '<textarea class="form-control" rows="5" disabled>' + JSON.stringify(element);
        }
    });
    $('#Editar').html(text);
    $('#buttonModal').click();
}

function codigoQRUnit(datos) {
    console.log(datos);
    lista.forEach(function (element) {
        if (element.id === datos) {
            var data = data;
            var pass = element.pass;
            console.log('entra');
            obtenerQRUnico({id: datos, pass: pass, num: element.num});
            console.log({id: datos, pass: pass, num: element.num});
        }
    });
}

function eliminar(data) {
    var txt;
    var person = prompt("Si está seguro, escriba si:");
    if (person == null || person == "") {

    } else {
        if (person === "YES") {
            lista.forEach(function (element) {
                if (element.id === data) {
                    socket.emit('eliminarMascota', {num: element.num, id: data, pass: element.pass});
                }
            });
        }
    }
}

socket.on('actualizarLista', function (data) {
    putLista(data);
});

function buscar() {
    setTimeout(
        function () {
            var type = $('#tipoBusqueda').val();
            var text = $('#Buscar').val();
            socket.emit('predictivo', text, type);
        }, 1);
}

socket.on('disconnect', function () {
    console.log('se desconecto');
});


socket.on('nuevaRespuesta', function () {
    console.log('Correcto');
});
