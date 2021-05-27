let express = require('express');
let app = express();
let bd = require('./bd.js');
let axios = require('axios');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let server = require('http');
let fs = require('fs');
const requestIp = require('request-ip');
let server_config = {
    key: fs.readFileSync('encrypt2/HSSL-5fc7eacc26aac.key'),
    cert: fs.readFileSync('encrypt2/mascotasegura_co.pem'),
    ca: [
        fs.readFileSync('encrypt2/USERTrustRSAAAACA.pem'),
        fs.readFileSync('encrypt2/SectigoRSADomainValidationSecureServerCA.pem'),
    ],
    // requestCert: false,
    // rejectUnauthorized: false
};
let https = require('https');
let serverSSL = https.createServer(server_config, app);
let io = require('socket.io')(serverSSL);
let bodyParser = require('body-parser');
let multer = require('multer');
let nodemailer = require('nodemailer');
const csv = require('csv-parser');

// Funciona

app.use('/', express.static(__dirname + '/views/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'uwherqwe976hnfd78h6a1234jk', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//home
app.get('/', function (req, res) {
    if (req.query.producto === 'true') {
        res.redirect("https://mascotasegura.co/productos");
    } else {
        res.render('pages/inicio', {nombre: 'Inicio'});
    }
});

//comprar
app.get('/comprar', function (req, res) {
    res.render('pages/comprar', {nombre: 'Comprar'});
});

//Veterinarias
app.get('/aliados', function (req, res) {
    res.render('pages/aliados', {nombre: 'Aliados'});
});

//Contactanos
app.get('/contactanos', function (req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.render('pages/contactanos', {nombre: 'Contactanos'});
});

//pagar
app.get('/pagar', function (req, res) {
    let sessionId = req.sessionID + new Date().getTime();
    if (req.query.tipo === undefined) {
        res.redirect('https://mascotasegura.co/producto/personalizada')
    } else {
        if (req.query.tipo === 'clasica' || req.query.tipo === 'personalizada' || req.query.tipo === 'personalizada') {
            console.log(req.query.tipo);
            switch (req.query.tipo) {
                case 'clasica':
                    res.cookie().render('pages/pagarC', {
                        nombre: 'Pagar',
                        id: sessionId,
                        cookie: req.cookies._gid,
                    });
                    break;
                case 'premium':
                    res.cookie().render('pages/pagarP', {
                        nombre: 'Pagar',
                        id: sessionId,
                        cookie: req.cookies._gid,
                    });
                    break;
                case 'personalizada':
                    if (req.query.name !== undefined || req.query.cel !== undefined) {
                        console.log(req.query.cel);
                        res.cookie().render('pages/pagarN', {
                            nombre: 'Pagar',
                            id: sessionId,
                            tipo: req.query.tipo,
                            cookie: req.cookies._gid,
                            name: req.query.name,
                            celular: req.query.cel
                        });
                    } else {
                        res.redirect('https://mascotasegura.co/producto/personalizada')
                    }
                    break;
                default:
                    res.redirect('https://mascotasegura.co/producto/personalizada');
                    break;
            }
        } else {
            res.redirect('https://mascotasegura.co/producto/personalizada');
        }
    }
    // if (req.query.cantidad === undefined) {
    //     res.redirect("https://mascotasegura.co/comprar");
    // } else {
    //     console.log(req.query.codPromocional);
    //     if (req.query.cantidad <= 10 && req.query.cantidad >= 1) {
    //         res.cookie().render('pages/pagar', {
    //             nombre: 'Pagar',
    //             id: sessionId,
    //             cookie: req.cookies._gid,
    //             cantidad: req.query.cantidad,
    //             codPromocional: req.query.codPromocional
    //         })
    //     } else {
    //         res.redirect("https://mascotasegura.co/comprar");
    //     }
    // }
})

// Instrucciones de uso
app.get('/instrucciones', function (req, res) {
    res.render('pages/libro', {nombre: 'Instrucciones'});
});

app.get('/adminTodos/compras', function (req, res) {
    var object = {
        "test": false,
        "language": "en",
        "command": "ORDER_DETAIL",
        "merchant": {
            "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
            "apiLogin": "y4DPFG53Cj26UZs"
        },
        "details": {
            "orderId": 250636461
        }
    };

    let variable = 'algo';

    axios.post('https://api.payulatam.com/reports-api/4.0/service.cgi', object)
        .then((res) => {
            variable = res;
        })
        .catch((error) => {
            if (error.response) {
                console.log(error);
                variable = res;

            }
        });
    res.send(variable);
});

//Compra terminada
app.get('/pagos/terminado', function (req, res) {
    let transactionState = req.query.polTransactionState;
    let responseCode = req.query.polResponseCode;
    let estado;
    if (transactionState === '4' && responseCode === '1') {
        estado = "Transacción aprobada";
    } else if (transactionState === '6' && responseCode === '5') {
        estado = "Transacción fallida";
    } else if (transactionState === '6' && responseCode === '4') {
        estado = "Transacción rechazada";
    } else if ((transactionState === '12' || transactionState === '14') && (responseCode === '9994' || responseCode === '25')) {
        estado = "Transacción pendiente, por favor revisar si el débito fue realizado en el banco.";
    }

    let jsonData = {
        nombre: 'Pago terminado',
        fecha: req.query.processingDate,
        referenciaPedido: req.query.referenceCode,
        referenciaTransaccion: req.query.transactionId,
        numeroTransaccion: req.query.cus,
        banco: req.query.pseBank,
        estado: estado,
        valor: req.query.TX_VALUE,
        moneda: req.query.currency,
        descripcion: req.query.description,
        ipOrigen: req.query.pseReference1
    }

    res.render('pages/buy/terminado', jsonData);
})

app.get('/pagos/final', function (req, res) {
    let transactionState = req.query.polTransactionState;
    let responseCode = req.query.polResponseCode;
    let estado;
    if (transactionState === '4' && responseCode === '1') {
        estado = "Transacción aprobada";
    } else if (transactionState === '6' && responseCode === '5') {
        estado = "Transacción fallida";
    } else if (transactionState === '6' && responseCode === '4') {
        estado = "Transacción rechazada";
    } else if ((transactionState === '12' || transactionState === '14') && (responseCode === '9994' || responseCode === '25')) {
        estado = "Transacción pendiente, por favor revisar si el débito fue realizado en el banco.";
    }

    let jsonData = {
        nombre: 'Pago terminado',
        fecha: req.query.processingDate,
        referenciaPedido: req.query.referenceCode,
        referenciaTransaccion: req.query.transactionId,
        numeroTransaccion: req.query.cus,
        banco: req.query.pseBank,
        estado: estado,
        valor: req.query.TX_VALUE,
        moneda: req.query.currency,
        descripcion: req.query.description,
        ipOrigen: req.query.pseReference1
    }

    res.render('pages/buy/terminado', jsonData);
})

//Pagina producto
// app.get('/producto/clasica', function (req, res) {
//     res.render('pages/productos/clasica', {nombre: 'Clasica'});
// });

//Pagina producto
app.get('/producto/premium', function (req, res) {
    res.render('pages/productos/premium', {nombre: 'Premium'});
});

//Pagina producto
app.get('/producto/personalizada', function (req, res) {
    res.render('pages/productos/personalizada', {nombre: 'Personalizada'});
});

//Terminos y condiciones
app.get('/terminos-y-condiciones', function (req, res) {
    res.render('pages/terminosycondiciones', {nombre: 'Terminos y condiciones'});
});

//Quienes somos
app.get('/quienes-somos', function (req, res) {
    res.render('pages/quienes-somos', {nombre: 'Quienes somos'});
})

//Noticias
app.get('/noticias', function (req, res) {
    res.render('pages/noticias', {nombre: 'Noticias'});
});

//Compra finalizada
app.get('/buy/finish', function (req, res) {
    res.render('pages/buy/finish', {nombre: 'Compra exitosa!'});
});

// app.get('/productos', (req, res) => {
//     res.render('pages/producto', {nombre: 'Productos'});
// });

// Compra cancelada
app.get('/buy/cancel', function (req, res) {
    res.render('pages/buy/cancel', {nombre: 'Compra cancelada'});
});

//
app.get('/comunidad', function (req, res) {
    res.render('pages/preguntasfrecuentes', {nombre: 'Comunidad'});
});

app.get('/bienvenida', function (req, res) {
    res.render('pages/bienvenida', {nombre: 'Bienvenido!'});
});


//Mascotas publico
app.get('/mascota/ver', function (req, res) {
    var id = req.query.id;
    bd.buscarMascota(function (data) {
        var datos = null;
        data.forEach(function (element) {
            if (element.id === id) {
                datos = element;
                return false;
            } else {
                return true;
            }
        });
        if (datos === null) {
            res.render('pages/mascotas/mascotaNoExiste');
        } else {
            if (datos.name != null) {
                if (datos.placaPerdida === undefined || datos.placaPerdida === false) {
                    res.render('pages/mascotas/ver', datos);
                } else {
                    res.render('pages/mascotas/placaPerdida');
                }
            } else {
                res.render('pages/mascotas/mascotaNoRegistrada');
            }
        }

    });
});

//Acceder admin a mascota
app.get('/mascota/admin', function (req, res) {
    var id = req.query.id;
    var pass = req.query.pass;
    if (pass === undefined) {
        res.redirect("https://mascotasegura.co/mascota/ver?id=" + id);
    } else {
        bd.searchSecure(id, pass, function (data) {
            if (data.length === 1) {
                if (data[0].placaPerdida === undefined || data[0].placaPerdida === false) {
                    if (data[0].name === undefined || req.query.edit === 'edit') {
                        if (req.query.edit === 'edit') {
                            let json = data[0];
                            res.render('pages/mascotas/admonEditar', json);
                        } else {
                            res.render('pages/mascotas/admonEditarN', {id: id, pass: pass});
                        }
                    } else {
                        res.render('pages/mascotas/admonMascota', data[0]);
                    }
                } else {
                    res.render('pages/mascotas/placaPerdida');
                }
            } else {
                res.render('pages/mascotas/mascotaNoExiste');
            }
        });
    }
});

app.get('/app/mascotas', function (req, res) {
    var id = req.query.id;
    var pass = req.query.pass;
    if (pass === undefined) {
        res.send("placaSola&");
    } else {
        bd.searchSecure(id, pass, function (data) {
            if (data.length === 1) {
                if (data[0].placaPerdida === undefined || data[0].placaPerdida === false) {
                    if (data[0].name === undefined || req.query.edit === 'edit') {
                        if (req.query.edit === 'edit') {
                            let json = data[0];
                            res.send('editar&');
                        } else {
                            res.send('editarNew&');
                        }
                    } else {
                        res.send('Exist&' + data[0].num);
                    }
                } else {
                    res.send('placaPerdida&');
                }
            } else {
                res.send('PlacaNoExiste&');
            }
        });
    }
});

app.get('/app/mascotas/info', function (req, res) {
    var id = req.query.id;
    var pass = req.query.pass;
    if (pass === undefined) {
        res.send("solo id&");
    } else {
        bd.searchSecure(id, pass, function (data) {
            if (data.length === 1) {
                if (data[0].placaPerdida === undefined || data[0].placaPerdida === false) {
                    if (data[0].name === undefined || req.query.edit === 'edit') {
                        if (req.query.edit === 'edit') {
                            res.send('editar&');
                        } else {
                            res.send('editarNew&');
                        }
                    } else {
                        res.send(data[0]);
                    }
                } else {
                    res.send('placaPerdida&');
                }
            } else {
                res.send('PlacaNoExiste&');
            }
        });
    }
})

//guardar archivos
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/public/mascotas/fotos');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({storage: storage});

//Subir archivos y obtener respuesta
app.post('/upload', upload.single('fotoMascota'), (req, res) => {
    console.log(req.body);
    var ver = {
        id: req.body.cc,
        pass: req.body.pass
    };
    var update = {
        name: req.body.nombre,
        fechaNacimiento: req.body.fechaNacimiento,
        email: req.body.email,
        especie: req.body.mascota,
        raza: req.body.raza,
        color: req.body.color,
        descripcion: req.body.Descripcion,
        celular1: req.body.celular1Country + req.body.celular1,
        celular2: req.body.celular2Country + req.body.celular2,
        telefono: req.body.telefonoCountry + req.body.telefono,
        pais: req.body.pais,
        ciudad: req.body.ciudad,
        direccion: req.body.direccion,
        recomendaciones: req.body.recomendaciones,
        recompensa: req.body.recompensa,
        perdida: false,
        esterilizada: req.body.esterilizada,
        veterinarioNombre: req.body.nameVeterinario,
        veterinarioCel: req.body.veterinarioCountry + req.body.numberVeterinario,
        vacunas: req.body.vacunas,
        parasitos: req.body.parasitos,
        position: [],
        whatsapp: req.body.whatsappCountry + req.body.Whatsapp,
        foto: 'asd'
    };

    if (req.file !== undefined) {
        update.foto = req.file.filename;
    } else {
        delete update['foto'];
    }

    if (req.body.nombre === undefined) {
        delete update['name'];
    }
    if (req.body.especie === undefined) {
        delete update['especie'];
    }
    if (req.body.mascota === undefined) {
        delete update['mascota'];
    }
    if (req.body.raza === undefined) {
        delete update['raza'];
    }
    if (req.body.color === undefined) {
        delete update['color'];
    }
    if (req.body.fechaNacimiento === "") {
        delete update['fechaNacimiento'];
    }
    if (req.body.fechaNacimiento === undefined) {
        delete update['fechaNacimiento'];
    }
    if (req.body.email === "") {
        delete update['email'];
    }
    if (req.body.raza === "") {
        delete update['raza'];
    }
    if (req.body.color === "") {
        delete update['color'];
    }
    if (req.body.Descripcion === "") {
        delete update['descripcion'];
    }
    if (req.body.recompensa === undefined) {
        update.recompensa = '0';
    } else {
        update.recompensa = '1';
    }
    if (req.body.celular1 === "") {
        delete update['celular1'];
    }
    if (req.body.celular2 === "") {
        delete update['celular2'];
    }
    if (req.body.telefono === "") {
        delete update['telefono'];
    }
    if (req.body.Whatsapp === "") {
        delete update['whatsapp'];
    }
    if (req.body.pais === "") {
        delete update['pais'];
    }
    if (req.body.ciudad === "") {
        delete update['ciudad'];
    }
    if (req.body.direccion === "") {
        delete update['direccion'];
    }
    if (req.body.recomendaciones === "") {
        delete update['recomendaciones'];
    }
    if (req.body.esterilizada === undefined) {
        update.esterilizada = '0';
    } else {
        update.esterilizada = '1';
    }
    if (req.body.nameVeterinario === "") {
        delete update.veterinarioNombre;
    }
    if (req.body.numberVeterinario === "") {
        delete update.veterinarioCel;
    }
    if (req.body.vacunas === undefined) {
        delete update.vacunas;
    }
    if (req.body.parasitos === undefined) {
        delete update.parasitos;
    }

    console.log(update);

    bd.update(ver, update, function (respuesta) {
        if (respuesta == "Ok") {
            res.render('pages/mascotas/bienvenida.ejs');
        } else {
            res.send('Lo sentimos, algo salio mal, por favor comunicate con nostros para ayudarte lo antes posible');
        }
    });
});

//Mascota lugares visto
app.get('/mascotas/lugares-visto', function (req, res) {
    let id = req.query.id;
    bd.searchNotSecure(id, function (data) {
        if (data.length === 1) {
            bd.buscarUbicaciones({id: id}, function (datos) {
                if (datos === 'No hay posiciones') {
                    res.send('Lo sentimos, no hemos visto a tu mascota');
                } else {
                    res.render('pages/mascotas/lugaresVisto', {data: datos, id: id});
                }
            });
        } else {
            res.render('pages/mascotas/mascotaNoExiste');
        }
    });
});

//Admin
app.get('/adminJonathan/Secure', function (req, res) {
    res.send('<form action="../admin" method="POST">\n' +
        '  Name:<br>\n' +
        '  <input type="text" name="id"><br>\n' +
        '  Pass:<br>\n' +
        '  <input type="password" name="pass"><br><br>\n' +
        '  Secure:<br>\n' +
        '  <input type="password" name="secure"><br><br>\n' +
        '<input type="submit" name="submit" value="Enviar" />' +
        '</form>');
});

app.post('/admin', function (req, res) {
    let id = req.body.id;
    let pass = req.body.pass;
    let secure = req.body.secure;
    if (id === 'JonathanMoya' && pass === "JO00na0709" && secure === "YU98ly0623") {
        res.render('pages/admin/showdb');
    } else if (id === 'RichardMoya' && pass === "JO77ny0929" && secure === "YU98ly0623") {
        res.render('pages/admin/input');
    } else if (id === 'ComprasSecure' && pass === 'YU98ly0623' && secure === '2019JO77ny0929**') {
        res.render('pages/admin/compras');
    } else {
        let text = requestIp.getClientIp(req) + " User:" + id + " Pass:" + pass + " Secure:" + secure;
        fs.appendFile('SecurityReg/admin.txt', '\n ' + text, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Alguien trato de entrar');
            }
        })
        res.send('Acceso denegado');
    }
});

app.get('/mobile/getPetData', function (req, res) {
    var id = req.query.id;
    var pass = req.query.pass;
    var id = req.query.id;
    var pass = req.query.pass;
    if (pass === undefined) {
        res.send({error: 'Incorrecto'})
    } else {
        bd.searchSecure(id, pass, function (data) {
            if (data.length === 1) {
                if (data[0].placaPerdida === undefined || data[0].placaPerdida === false) {
                    if (data[0].name === undefined || req.query.edit === 'edit') {
                        //Ya existe
                        res.send(data);
                    } else {
                        //No existe
                        res.send(data);
                    }
                } else {
                    res.send({error: 'Incorrecto'})
                }
            } else {
                res.send({error: 'Incorrecto'})
            }
        })
    }
});

//comunicacion cliente-servidor

const comprasSocket = io.of('/compras');

comprasSocket.on('connection', function (socket) {

    var object = {
        "language": "es",
        "command": "GET_BANKS_LIST",
        "merchant": {
            "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
            "apiLogin": "y4DPFG53Cj26UZs"
        },
        "test": false,
        "bankListInformation": {
            "paymentMethod": "PSE",
            "paymentCountry": "CO"
        }
    }

    axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
        .then((res) => {
            socket.emit('conection', res.data);
        })
        .catch((error) => {
            if (error.response) {
                console.log(err);
            }
            console.log('Error mi compa');
        });

    socket.on('compra/Tarjetadecredito', function (data) {
        console.log(data.placa);
        let num;
        bd.consultaUltimoPago(function (res) {
            num = res;
            num++;
            var md5 = require("blueimp-md5");
            var signature = md5('jDMEI0Cg80KUT8P4cu3XMtPP3e~806182~' + num + '~' + data.costo + '~COP');

            var object = {
                "language": "es",
                "command": "SUBMIT_TRANSACTION",
                "merchant": {
                    "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                    "apiLogin": "y4DPFG53Cj26UZs"
                },
                "transaction": {
                    "order": {
                        "accountId": '813224',
                        "referenceCode": num,
                        "description": "Placa para mascotas",
                        "language": "es",
                        "signature": signature,
                        "notifyUrl": "http://www.mascotasegura.co/confirmation",
                        "additionalValues": {
                            "TX_VALUE": {
                                "value": data.costo,
                                "currency": "COP"
                            },
                            "TX_TAX": {
                                "value": ((data.costo / 100) * 19),
                                "currency": "COP"
                            },
                            "TX_TAX_RETURN_BASE": {
                                "value": (data.costo - (data.costo / 100) * 19),
                                "currency": "COP"
                            },
                        },
                        "buyer": {
                            "merchantBuyerId": "1",
                            "fullName": data.comprador.name,
                            "emailAddress": data.comprador.email,
                            "contactPhone": data.comprador.phone,
                            "shippingAddress": {
                                "street1": data.comprador.street,
                                "city": data.comprador.city,
                                "state": data.comprador.state,
                                "country": "CO",
                                "phone": data.comprador.phone,
                            }
                        },
                        "shippingAddress": {
                            "street1": data.comprador.street,
                            "city": data.comprador.city,
                            "state": data.comprador.state,
                            "country": "CO",
                            "phone": data.comprador.phone,
                        }
                    },
                    "payer": {
                        "merchantPayerId": "1",
                        "fullName": data.pagador.name,
                        "emailAddress": data.pagador.email,
                        "contactPhone": data.pagador.phone,
                        "dniType": data.pagador.tipoDocumento,
                        "dniNumber": data.pagador.cedula,
                        "billingAddress": {
                            "street1": data.pagador.street,
                            "city": data.pagador.city,
                            "state": data.pagador.state,
                            "country": "CO",
                        }
                    },
                    "creditCard": {
                        "number": data.creditCard,
                        "securityCode": data.securityCode,
                        "expirationDate": data.expirationDate,
                        "name": data.nameCreditCard
                    },
                    "extraParameters": {
                        "INSTALLMENTS_NUMBER": 1
                    },
                    "type": "AUTHORIZATION_AND_CAPTURE",
                    "paymentMethod": data.paymentMethod,
                    "paymentCountry": "CO",
                    "deviceSessionId": data.sessionId,
                    "ipAddress": data.ip,
                    "cookie": data.cookie,//GA1.2.1439160980.1558028406
                    "userAgent": data.userAgent
                },
                "test": true
            }

            console.log(data.placa);

            // axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
            //     .then((res) => {
            //         datosCompra = {
            //             name: 'Compra',
            //             num: num,
            //             state: res.data.transactionResponse.responseCode,
            //             referenceCode: num,
            //             transactionId: res.data.transactionResponse.trazabilityCode,
            //             orderId: res.data.transactionResponse.orderId,
            //             responseCode: res.data.transactionResponse.responseCode,
            //             operationDate: res.data.transactionResponse.transactionDate,
            //             metodoPago: 'tarjeta',
            //             placa: {
            //                 nombre: data.placa.nombre,
            //                 celular: data.placa.cel
            //             }
            //         }
            //
            //         bd.pagoInsertCompra(datosCompra, function (res) {
            //         })
            //         socket.emit('compra/tarjetacredito', res.data);
            //     })
            //     .catch((error) => {
            //         if (error.response) {
            //             console.log(error);
            //         }
            //     });
        });
    });

    socket.on('compra/PSE', function (data) {
        let num;
        bd.consultaUltimoPago(function (res) {
            num = res + 1;
            var md5 = require("blueimp-md5");
            var signature = md5('jDMEI0Cg80KUT8P4cu3XMtPP3e~806182~' + num + '~' + data.costo + '~COP');
            var object = {
                "language": "es",
                "command": "SUBMIT_TRANSACTION",
                "merchant": {
                    "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                    "apiLogin": "y4DPFG53Cj26UZs"
                },
                "transaction": {
                    "order": {
                        "accountId": '813224',
                        "referenceCode": num,
                        "description": "Placa para mascotas - Mascota Segura®",
                        "language": "es",
                        "signature": signature,
                        "additionalValues": {
                            "TX_VALUE": {
                                "value": data.costo,
                                "currency": "COP"
                            },
                            "TX_TAX": {
                                "value": ((data.costo / 100) * 19),
                                "currency": "COP"
                            },
                            "TX_TAX_RETURN_BASE": {
                                "value": (data.costo - (data.costo / 100) * 19),
                                "currency": "COP"
                            },
                        },
                        "buyer": {
                            "emailAddress": data.email,
                        }
                    },
                    "payer": {
                        "fullName": data.name,
                        "emailAddress": data.email,
                        "contactPhone": data.phone,
                        "billingAddress": {
                            "street1": data.street,
                            "city": data.city,
                            "state": data.state,
                            "country": "CO",
                        }
                    },
                    "extraParameters": {
                        "RESPONSE_URL": "https://www.mascotasegura.co/pagos/terminado",
                        "PSE_REFERENCE1": data.ip,
                        "FINANCIAL_INSTITUTION_CODE": data.codeBank,
                        "USER_TYPE": data.typeUser,
                        "PSE_REFERENCE2": data.typeCC,
                        "PSE_REFERENCE3": data.cc
                    },
                    "type": "AUTHORIZATION_AND_CAPTURE",
                    "paymentMethod": "PSE",
                    "paymentCountry": "CO",
                    "cookie": data.cookie,//GA1.2.1439160980.1558028406
                    "userAgent": data.userAgent,
                    "ipAddress": data.ip

                },
                "test": false
            }


            axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
                .then((res) => {
                    datosCompra = {
                        name: 'Compra',
                        num: num,
                        state: res.data.transactionResponse.responseCode,
                        referenceCode: num,
                        transactionId: res.data.transactionResponse.trazabilityCode,
                        orderId: res.data.transactionResponse.orderId,
                        responseCode: res.data.transactionResponse.responseCode,
                        operationDate: res.data.transactionResponse.transactionDate,
                        metodoPago: 'PSE'
                    }
                    bd.pagoInsertCompra(datosCompra, function (call) {
                    })
                    let respuesta = {
                        url: res.data.transactionResponse.extraParameters.BANK_URL
                    }
                    socket.emit('compra/PSE', respuesta);
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error);
                    }
                });
        });
    })

    socket.on('compra/Efectivo', function (data) {
        let num;
        bd.consultaUltimoPago(function (res) {
            num = res + 1;

            var md5 = require("blueimp-md5");
            var signature = md5('jDMEI0Cg80KUT8P4cu3XMtPP3e~806182~' + num + '~' + data.costo + '~COP');

            var object = {
                "language": "es",
                "command": "SUBMIT_TRANSACTION",
                "merchant": {
                    "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                    "apiLogin": "y4DPFG53Cj26UZs"
                },
                "transaction": {
                    "order": {
                        "accountId": '813224',
                        "referenceCode": num,
                        "description": "Placa para mascotas",
                        "language": "es",
                        "signature": signature,
                        "notifyUrl": "http://www.mascotasegura.co/confirmacionCompra",
                        "additionalValues": {
                            "TX_VALUE": {
                                "value": data.costo,
                                "currency": "COP"
                            },
                            "TX_TAX": {
                                "value": ((data.costo / 100) * 19),
                                "currency": "COP"
                            },
                            "TX_TAX_RETURN_BASE": {
                                "value": (data.costo - (data.costo / 100) * 19),
                                "currency": "COP"
                            },
                        },
                        "buyer": {
                            "fullName": data.comprador.name,
                            "emailAddress": data.comprador.email,
                        }
                    },
                    "type": "AUTHORIZATION_AND_CAPTURE",
                    "paymentMethod": data.medioPago,
                    "paymentCountry": "CO",
                    "ipAddress": data.ip
                },
                "test": false
            }

            axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
                .then((res) => {
                    datosCompra = {
                        name: 'Compra',
                        comprador: {
                            "street1": data.comprador.street,
                            "city": data.comprador.city,
                            "state": data.comprador.state,
                            "country": "CO",
                        },
                        num: num,
                        state: res.data.transactionResponse.responseCode,
                        referenceCode: num,
                        transactionId: res.data.transactionResponse.trazabilityCode,
                        orderId: res.data.transactionResponse.orderId,
                        responseCode: res.data.transactionResponse.responseCode,
                        operationDate: res.data.transactionResponse.transactionDate,
                        metodoPago: 'efectivo'
                    }

                    bd.pagoInsertCompra(datosCompra, function (call) {
                    })
                    let respuesta = {
                        pdf: res.data.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_PDF,
                        url: res.data.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_HTML
                    }
                    socket.emit('compra/efectivo', respuesta);
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error);
                    }
                });
        });
    })

    socket.on('compra/TarjetadecreditoPersonalizada', function (data) {
        let num;
        bd.consultaUltimoPago(function (res) {
            num = res;
            num++;
            var md5 = require("blueimp-md5");
            var signature = md5('jDMEI0Cg80KUT8P4cu3XMtPP3e~806182~' + num + '~' + data.costo + '~COP');

            var object = {
                "language": "es",
                "command": "SUBMIT_TRANSACTION",
                "merchant": {
                    "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                    "apiLogin": "y4DPFG53Cj26UZs"
                },
                "transaction": {
                    "order": {
                        "accountId": '813224',
                        "referenceCode": num,
                        "description": "Placa para mascotas",
                        "language": "es",
                        "signature": signature,
                        "notifyUrl": "http://www.mascotasegura.co/confirmation",
                        "additionalValues": {
                            "TX_VALUE": {
                                "value": data.costo,
                                "currency": "COP"
                            },
                            "TX_TAX": {
                                "value": ((data.costo / 100) * 19),
                                "currency": "COP"
                            },
                            "TX_TAX_RETURN_BASE": {
                                "value": (data.costo - (data.costo / 100) * 19),
                                "currency": "COP"
                            },
                        },
                        "buyer": {
                            "merchantBuyerId": "1",
                            "fullName": data.comprador.name,
                            "emailAddress": data.comprador.email,
                            "contactPhone": data.comprador.phone,
                            "shippingAddress": {
                                "street1": data.comprador.street,
                                "city": data.comprador.city,
                                "state": data.comprador.state,
                                "country": "CO",
                                "phone": data.comprador.phone,
                            }
                        },
                        "shippingAddress": {
                            "street1": data.comprador.street,
                            "city": data.comprador.city,
                            "state": data.comprador.state,
                            "country": "CO",
                            "phone": data.comprador.phone,
                        }
                    },
                    "payer": {
                        "merchantPayerId": "1",
                        "fullName": data.pagador.name,
                        "emailAddress": data.pagador.email,
                        "contactPhone": data.pagador.phone,
                        "dniType": data.pagador.tipoDocumento,
                        "dniNumber": data.pagador.cedula,
                        "billingAddress": {
                            "street1": data.pagador.street,
                            "city": data.pagador.city,
                            "state": data.pagador.state,
                            "country": "CO",
                        }
                    },
                    "creditCard": {
                        "number": data.creditCard,
                        "securityCode": data.securityCode,
                        "expirationDate": data.expirationDate,
                        "name": data.nameCreditCard
                    },
                    "extraParameters": {
                        "INSTALLMENTS_NUMBER": 1
                    },
                    "type": "AUTHORIZATION_AND_CAPTURE",
                    "paymentMethod": data.paymentMethod,
                    "paymentCountry": "CO",
                    "deviceSessionId": data.sessionId,
                    "ipAddress": data.ip,
                    "cookie": data.cookie,//GA1.2.1439160980.1558028406
                    "userAgent": data.userAgent
                },
                "test": true
            }

            axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
                .then((res) => {
                    datosCompra = {
                        name: 'Compra',
                        num: num,
                        state: res.data.transactionResponse.responseCode,
                        referenceCode: num,
                        transactionId: res.data.transactionResponse.trazabilityCode,
                        orderId: res.data.transactionResponse.orderId,
                        responseCode: res.data.transactionResponse.responseCode,
                        operationDate: res.data.transactionResponse.transactionDate,
                        metodoPago: 'tarjeta',
                        placaname: data.placa
                    }

                    bd.pagoInsertCompra(datosCompra, function (res) {
                    })
                    socket.emit('compra/tarjetacredito', res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error);
                    }
                });
        });
    });

    socket.on('compra/PSEPersonalizada', function (data) {
        let num;
        bd.consultaUltimoPago(function (res) {
            num = res + 1;
            var md5 = require("blueimp-md5");
            var signature = md5('jDMEI0Cg80KUT8P4cu3XMtPP3e~806182~' + num + '~' + data.costo + '~COP');
            var object = {
                "language": "es",
                "command": "SUBMIT_TRANSACTION",
                "merchant": {
                    "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                    "apiLogin": "y4DPFG53Cj26UZs"
                },
                "transaction": {
                    "order": {
                        "accountId": '813224',
                        "referenceCode": num,
                        "description": "Placa para mascotas - Mascota Segura®",
                        "language": "es",
                        "signature": signature,
                        "additionalValues": {
                            "TX_VALUE": {
                                "value": data.costo,
                                "currency": "COP"
                            },
                            "TX_TAX": {
                                "value": ((data.costo / 100) * 19),
                                "currency": "COP"
                            },
                            "TX_TAX_RETURN_BASE": {
                                "value": (data.costo - (data.costo / 100) * 19),
                                "currency": "COP"
                            },
                        },
                        "buyer": {
                            "emailAddress": data.email,
                        }
                    },
                    "payer": {
                        "fullName": data.name,
                        "emailAddress": data.email,
                        "contactPhone": data.phone,
                        "billingAddress": {
                            "street1": data.street,
                            "city": data.city,
                            "state": data.state,
                            "country": "CO",
                        }
                    },
                    "extraParameters": {
                        "RESPONSE_URL": "https://www.mascotasegura.co/pagos/terminado",
                        "PSE_REFERENCE1": data.ip,
                        "FINANCIAL_INSTITUTION_CODE": data.codeBank,
                        "USER_TYPE": data.typeUser,
                        "PSE_REFERENCE2": data.typeCC,
                        "PSE_REFERENCE3": data.cc
                    },
                    "type": "AUTHORIZATION_AND_CAPTURE",
                    "paymentMethod": "PSE",
                    "paymentCountry": "CO",
                    "cookie": data.cookie,//GA1.2.1439160980.1558028406
                    "userAgent": data.userAgent,
                    "ipAddress": data.ip

                },
                "test": false
            }


            axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
                .then((res) => {
                    datosCompra = {
                        name: 'Compra',
                        num: num,
                        state: res.data.transactionResponse.responseCode,
                        referenceCode: num,
                        transactionId: res.data.transactionResponse.trazabilityCode,
                        orderId: res.data.transactionResponse.orderId,
                        responseCode: res.data.transactionResponse.responseCode,
                        operationDate: res.data.transactionResponse.transactionDate,
                        metodoPago: 'PSE',
                        placaname: data.placa
                    }
                    bd.pagoInsertCompra(datosCompra, function (call) {
                    })
                    let respuesta = {
                        url: res.data.transactionResponse.extraParameters.BANK_URL
                    }
                    socket.emit('compra/PSE', respuesta);
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error);
                    }
                });
        });
    })

    socket.on('compra/EfectivoPersonalizada', function (data) {
        let num;
        bd.consultaUltimoPago(function (res) {
            num = res + 1;

            var md5 = require("blueimp-md5");
            var signature = md5('jDMEI0Cg80KUT8P4cu3XMtPP3e~806182~' + num + '~' + data.costo + '~COP');

            var object = {
                "language": "es",
                "command": "SUBMIT_TRANSACTION",
                "merchant": {
                    "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                    "apiLogin": "y4DPFG53Cj26UZs"
                },
                "transaction": {
                    "order": {
                        "accountId": '813224',
                        "referenceCode": num,
                        "description": "Placa para mascotas",
                        "language": "es",
                        "signature": signature,
                        "notifyUrl": "http://www.mascotasegura.co/confirmacionCompra",
                        "additionalValues": {
                            "TX_VALUE": {
                                "value": data.costo,
                                "currency": "COP"
                            },
                            "TX_TAX": {
                                "value": ((data.costo / 100) * 19),
                                "currency": "COP"
                            },
                            "TX_TAX_RETURN_BASE": {
                                "value": (data.costo - (data.costo / 100) * 19),
                                "currency": "COP"
                            },
                        },
                        "buyer": {
                            "fullName": data.comprador.name,
                            "emailAddress": data.comprador.email,
                        }
                    },
                    "type": "AUTHORIZATION_AND_CAPTURE",
                    "paymentMethod": data.medioPago,
                    "paymentCountry": "CO",
                    "ipAddress": data.ip
                },
                "test": false
            }

            axios.post('https://api.payulatam.com/payments-api/4.0/service.cgi', object)
                .then((res) => {
                    datosCompra = {
                        name: 'Compra',
                        comprador: {
                            "street1": data.comprador.street,
                            "city": data.comprador.city,
                            "state": data.comprador.state,
                            "country": "CO",
                        },
                        num: num,
                        state: res.data.transactionResponse.responseCode,
                        referenceCode: num,
                        transactionId: res.data.transactionResponse.trazabilityCode,
                        orderId: res.data.transactionResponse.orderId,
                        responseCode: res.data.transactionResponse.responseCode,
                        operationDate: res.data.transactionResponse.transactionDate,
                        metodoPago: 'efectivo',
                        placaname: data.placa
                    }

                    bd.pagoInsertCompra(datosCompra, function (call) {
                    })
                    let respuesta = {
                        pdf: res.data.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_PDF,
                        url: res.data.transactionResponse.extraParameters.URL_PAYMENT_RECEIPT_HTML
                    }
                    socket.emit('compra/efectivo', respuesta);
                })
                .catch((error) => {
                    if (error.response) {
                        console.log(error);
                    }
                });
        });
    })


});

const appSocket = io.of('/appSocket');

appSocket.on('connection', function (socket) {
    socket.emit('saludo', 'Hola, estas funcionando :)');

    socket.on('mascota/perdidaAdmin', function (datos) {
        bd.mascotaPerdida(JSON.parse(datos), function (respuesta) {
            socket.emit('mascotaPerdida', respuesta);
        });
    });

    socket.on('mascota/apareceAdmin', function (datos) {
        bd.mascotaAparece(JSON.parse(datos), function (respuesta) {
            socket.emit('mascotaAparece', respuesta);
        });
    });

    socket.on('correoEnviar', function (data) {
        var to;
        if (data.departamento === 'Ventas') {
            to = 'ventas@mascotasegura.co';
        } else if (data.departamento === "Servicio al cliente") {
            to = "servicioalcliente@mascotasegura.co";
        } else if (data.departamento === "Soporte tecnico") {
            to = "produccion@mascotasegura.co";
        }
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mascotasegura.co@gmail.com',
                pass: 'yu98ly0623'
            }
        });

        var mailOptions = {
            to: to,
            subject: 'Email Contactanos',
            text: "Email: " + data.email + '\n' + '\n' +
                'Mensaje: ' + data.mensaje + '\n' +
                'Telefono: ' + data.telefono
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                socket.emit('correoRespuesta', "mal");
            } else {
                socket.emit('correoRespuesta', "bien");
            }
        });
    })

    socket.on('actualizarDatos', function (data) {
        bd.update(JSON.parse(data[1]), JSON.parse(data[0]), function (respuesta) {
        });
    })

})

const adminSocket = io.of('/admin');

adminSocket.on('connection', function (socket) {
    bd.buscarTodosLimit(30, function (data) {
        socket.emit("lista", data);
    });
    socket.on('getCompras', function () {
        bd.getCompras(function (res) {
            // console.log(res);
            var array = [];
            var placas = [];
            for (var i = 0; i < res.length; i++) {
                var object = {
                    "test": false,
                    "language": "en",
                    "command": "ORDER_DETAIL",
                    "merchant": {
                        "apiKey": "jDMEI0Cg80KUT8P4cu3XMtPP3e",
                        "apiLogin": "y4DPFG53Cj26UZs"
                    },
                    "details": {
                        "orderId": res[i].orderId
                    }
                };

                if (res[i].placaname) {
                    placas.push({
                        id: res[i].orderId,
                        placa: {
                            name: res[i].placaname.nombre,
                            numero: res[i].placaname.cel
                        }
                    });
                }


                axios.post('https://api.payulatam.com/reports-api/4.0/service.cgi', object)
                    .then((response) => {
                        if (response.data.result.payload.transactions[0].transactionResponse.responseCode === 'APPROVED') {
                            json = response.data.result.payload.transactions[0];
                            // console.log(response.data.transactionResponse.orderId);
                            // console.log('Ok');
                            placas.forEach(function (el) {
                                if (el.id === response.data.result.payload.id) {
                                    // console.log('Si es')
                                    json.placa = el.placa;
                                }
                                // console.log(response.data.result.payload.id);
                                // console.log(el);
                            });


                            array.push(json);
                        } else {
                            // console.log('No');
                        }
                        // json.prop = i;
                        // console.log(res[i].placaname);
                        // console.log(res[i].orderId);
                        // if(res[i].responseCode){
                        //     console.log('Personalizada')
                        // }else{
                        //     console.log('No es')
                        // }
                        // json.placa = {
                        //     name: res.placaname.nombre,
                        //     numero: res.placaname.cel
                        // }
                    })
                    .catch((error) => {
                        if (error.response) {
                            array.push(error.response);
                        }
                    });
            }


            setTimeout(function () {
                socket.emit('getCompras', array)
            }, 2000);
        })
    })
    socket.on('uploadJSON', function (data) {
        bd.subirDB(data, function (respuesta) {
            socket.emit('uploadJSON', respuesta);
        })
    });
    socket.on('listaCompleta', function () {
        bd.buscarTodos(function (data) {
            socket.emit("listaCompleta", data);
        });
    });
    socket.on('eliminarMascota', function (data) {
        bd.eliminarMascota(data, function (callback) {
            bd.buscarTodosLimit(20, function (Data) {
                socket.emit('actualizarLista', Data);
            });
        })
    });
    socket.on('predictivo', function (predictivo, option) {
        bd.search(predictivo, option, function (data) {
            socket.emit('lista', data);
        })
    });
    socket.on('placaPerdida', function (data) {
        bd.setPerdida(data, function (callback) {
            bd.buscarTodosLimit(20, function (Data) {
                socket.emit('actualizarLista', Data);
            });
        });
    });

    socket.on('createBU', function () {
        bd.getAllPets(function (res) {

        })
    })

    socket.on('generateBU', function () {
        var date = new Date();
        var workbook = new Excel.Workbook();
        var sheet = workbook.addWorksheet();
        sheet.columns = [
            {key: 'cc'},
            {key: 'name'},
            {key: 'cargo'},
            {key: 'asistencia'},
            {key: 'fecha'},
        ];
        bd.getAllPets(function (callback) {
            callback.forEach(function (el) {
                let asistencia;
                if (el.asistencia) {
                    asistencia = 'true'
                } else {
                    asistencia = 'false'
                }
                let json = {
                    cc: el.cc,
                    name: el.name,
                    cargo: el.cargo,
                    fecha: fecha,
                    asistencia: asistencia
                };
                sheet.addRow(json);
            });
            let hora = date.getHours().toString();
            let minutos = date.getMinutes().toString();
            if (date.getHours() <= 9) {
                hora = '0' + date.getHours().toString();
            }
            if (date.getMinutes() <= 9) {
                minutos = '0' + date.getMinutes().toString();
            }
            let nameString = 'public/BU/' + hora + '-' + minutos + ".xlsx";
            workbook.xlsx.writeFile(nameString).then(function () {
                console.log("csv file is written." + nameString);
            });
        })
    });


});

io.on('connection', function (socket) {
    bd.buscarTodos(function (data) {
        socket.emit("lista", data);
    });

    socket.emit('conection', "Entraaaaa");

    //Registrar nuevas mascotas, solo admin
    socket.on('nuevaMascota', function (datos) {
        bd.insertar(datos, function (respuesta) {
            if (respuesta == "Correcto") {
                bd.buscarTodos(function (data) {
                    socket.emit("lista", data);
                });
            }
        });
    });

    socket.on('getPetAdmin', function (data) {
        bd.searchSecure(data.id, data.pass, function (result) {
            socket.emit('mascotaPetData', result);
        })
    })

    //Mascotas parte de cliente
    //Se pierde la mascota
    socket.on('mascota/perdidaAdmin', function (datos) {
        bd.mascotaPerdida(datos, function (respuesta) {
            socket.emit('mascotaPerdida', respuesta);
        });
    });

    //Aparece la mascota
    socket.on('mascota/apareceAdmin', function (datos) {
        bd.mascotaAparece(datos, function (respuesta) {
            socket.emit('mascotaAparece', respuesta);
        });
    });

    socket.on('mascota/position', function (data) {
        console.log('entraCorreo');
        bd.positionMascota(data, function (respuesta) {
            io.emit('mascotaLaVen', {id: data.id});

            var transporter = nodemailer.createTransport({
                host: "smtpout.secureserver.net",
                secureConnection: true,
                port: 465,
                auth: {
                    user: "servicioalcliente@mascotasegura.co",
                    pass: "YU98ly0623*"
                }
            });

            let mailOptions = {
                from: "servicioalcliente@mascotasegura.co",
                to: data.email,
                subject: 'Hemos encontrado a tu mascota!',
                html: 'Da click en el siguiente enlace para ver un mapa donde la hemos encontrado <a href="https://mascotasegura.co/mascotas/lugares-visto?id=' + data.id + '">link</a> Encuentrame!</a> </p>'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('error:', error);
                } else {
                    console.log('correo enviado' + data.email + ' ' + info.response)
                }
            });
        });
    });

    socket.on('actualizarLugares', function (id) {
        bd.searchNotSecure(id, function (data) {
            if (data.length === 1) {
                bd.buscarUbicaciones({id: id}, function (datos) {
                    if (datos === 'No hay posiciones') {
                    } else {
                        socket.emit('actualizarLugares', datos);
                    }
                });
            } else {
            }
        });
    })

    socket.on('correoEnviar', function (data) {
        var to;
        if (data.departamento === 'Ventas') {
            to = 'ventas@mascotasegura.co';
        } else if (data.departamento === "Servicio al cliente") {
            to = "servicioalcliente@mascotasegura.co";
        } else if (data.departamento === "Soporte tecnico") {
            to = "produccion@mascotasegura.co";
        }
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mascotasegura.co@gmail.com',
                pass: 'yu98ly0623'
            }
        });

        var mailOptions = {
            to: to,
            subject: 'Email Contactanos',
            text: "Email: " + data.email + '\n' + '\n' +
                'Mensaje: ' + data.mensaje + '\n' +
                'Telefono: ' + data.telefono
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                socket.emit('correoRespuesta', "mal");
            } else {
                socket.emit('correoRespuesta', "bien");
            }
        });
    });

    socket.on('codigoPromocional', function (data) {
        if (data === 'INSTA20') {
            socket.emit('codigoPromocionalCorrecto', 'ok');
        }
    })

    socket.on('correoEnviarCompra', function (data) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mascotasegura.co@gmail.com',
                pass: 'yu98ly0623'
            }
        });

        var mailOptions = {
            to: 'ventas@mascotasegura.co',
            subject: 'Venta email',
            text: "Email: " + data.email + '\n' + '\n' +
                'Mensaje: ' + data.mensaje
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                socket.emit('correoRespuestaCompra', "mal");
            } else {
                socket.emit('correoRespuestaCompra', "bien");
            }
        });
    })
});

app.get('*', function (req, res) {
    res.render('pages/error');
});

function httpGet() {
    const https = require('https');
    const options = {
        hostname: 'a1cards.com.co',
        port: 443,
        path: '/',
        method: 'GET',
        rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        if (res.statusCode !== 200) {
            var transporter = nodemailer.createTransport({
                host: "smtpout.secureserver.net",
                secureConnection: true,
                port: 465,
                auth: {
                    user: "ventas@a1cards.com.co",
                    pass: "79962949"
                }
            });

            var mailOptions = {
                from: 'ventas@a1cards.com.co',
                to: 'jmoyacarrero@yahoo.com',
                subject: 'Pagina incorrecta A1Cards',
                html: 'Error ' + res.statusCode
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('error:', error);
                    socket.emit('sendEmailContact', 'Error');
                } else {
                    socket.emit('sendEmailContact', 'Ok');
                }
            });
        }
    });

    req.on('error', (error) => {
        console.error(error)
    });

    req.end()
}

// setInterval(function () {
//     httpGet()
// }, 600000);

serverSSL.listen(443, function (err) {
    console.log("Mascota Segura listen port 443");
});

server.createServer(function (req, res) {
    res.writeHead(301, {"Location": "https://" + req.headers['host'] + req.url});
    res.end();
}).listen(80, function (err) {
    console.log("Mascota Segura listen port 80");
});

