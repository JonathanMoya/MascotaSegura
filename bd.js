var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/MascotaSegura";
//compras
MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
    var dbo = db.db("MascotaSegura");
    if (err) throw err;
    console.log('baseConectada');
    // dbo.createCollection("compras", function(err, res) {
    //     if (err) throw err;
    //     console.log("Collection created!");
    //     db.close();
    // });
    // dbo.collection("compras").find().toArray(function (err, result) {
    //     if (err) throw err;
    //     console.log(result);
    //     db.close();
    // });
    // var dbo = db.db("MascotaSegura");
    // var myobj = {
    //     name: "Compra",
    //     num: 70,
    //     state: "",
    //     referenceCode: "",
    //     transactionId: "",
    //     orderId: "",
    //     responseCode: "",
    //     operationDate: ""
    // };
    // dbo.collection("compras").insertOne(myobj, function (err, res) {
    //     if (err) throw err;
    //     console.log("1 document inserted");
    //     db.close();
    // });

    // var ver = {
    //     id: 'CV6797FC52',
    //     pass: 'CC3CPFC8E9',
    // };
    // var datos = {
    //     raza: 'Schnauzer miniatura'
    // }
    // if (err) throw err;
    // if (ver.id == null || ver.pass == null) {
    //     ver = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
    // }
    // let newvalues = {$set: datos};
    // dbo.collection("mascotas").updateOne(ver, newvalues, function (err, res) {
    //     if (err) throw err;
    //     console.log(res);
    //     db.close();
    // });
});

///                         C O M P R A S

exports.pagoInsertCompra = function (datos, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        var dbo = db.db("MascotaSegura");
        if (err) throw err;
        dbo.collection("compras").insertOne(datos, function (err, res) {
            if (err) throw err;
            console.log('Realizaron una compra');
            if (datos.state === "DECLINED") {
                callback('Declined');
            } else if (datos.state === "APPROVED") {
                callback('Approved');
            } else if (datos.state === "PENDING") {
                callback('correcto');
            }
            db.close();
        })
    });
};

exports.getCompras = function (callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        var dbo = db.db("MascotaSegura");
        if (err) throw err;
        dbo.collection("compras").find().toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
}

exports.consultaUltimoPago = function (callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        var dbo = db.db("MascotaSegura");
        if (err) throw err;
        dbo.collection("compras").find().toArray(function (err, result) {
            if (err) throw err;
            console.log(result[result.length - 1].num);
            callback(result[result.length - 1].num);
            db.close();
        });
    });
}


///                         C L I E N T E

//Busqueda para comprobar que existe
exports.searchSecure = function (id, pass, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        if (pass == null) {
            pass = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        if (id == null) {
            id = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        var obj = {id: id, pass: pass};
        var query = JSON.stringify(obj);
        dbo.collection("mascotas").find(JSON.parse(query)).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};

exports.searchNotSecure = function (id, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        if (id == null) {
            id = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        var obj = {id: id};
        var query = JSON.stringify(obj);
        dbo.collection("mascotas").find(JSON.parse(query)).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};

exports.buscarUbicaciones = function (ver, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db('MascotaSegura');
        if (ver.id == null) {
            ver = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        dbo.collection("mascotas").find(ver).toArray(function (err, result) {
            if (err) throw err;
            if (result[0].position === '[]') {
                callback('No hay posiciones');
            } else {
                callback(result[0].position);
            }
            db.close();
        });
    });
};

//Update mascota por parte del comprador
exports.update = function (ver, datos, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        let dbo = db.db('MascotaSegura');
        if (ver.id == null || ver.pass == null) {
            ver = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        let newvalues = {$set: datos};
        dbo.collection("mascotas").updateOne(ver, newvalues, function (err, res) {
            if (err) throw err;
            callback('Ok');
            db.close();
        });
    });
};

//Registrar mascota perdida
exports.mascotaPerdida = function (ver, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        let dbo = db.db('MascotaSegura');
        if (ver.id == null || ver.pass == null) {
            ver = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }

        console.log(ver);

        dbo.collection('mascotas').updateOne({id: ver.id, pass: ver.pass}, {
            $set: {
                perdida: true,
                datosPerdida: ver.datos
            }
        }, function (err, res) {
            if (err) throw err;
            callback(res.result);
            db.close();
        });
    });
};

exports.mascotaAparece = function (ver, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        if (ver.id == null || ver.pass == null) {
            ver = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        let dbo = db.db('MascotaSegura');
        dbo.collection('mascotas').updateOne(ver, {
            $set: {
                perdida: false,
                position: [],
                perdidaAnytime: true,
                datosPerdida: ''
            }
        }, function (err, res) {
            if (err) throw err;
            callback(res.result);
            db.close();
        })
    });
};

exports.eliminarMascota = function (data, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        let dbo = db.db('MascotaSegura');
        if (data.id == null || data.pass == null) {
            data = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        dbo.collection("mascotas").deleteOne(data, function (err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
        dbo.collection('mascotas').insertOne(data, function (err, obj) {
            if (err) throw err;
            console.log("1 document inserted");
            callback(obj.insertedCount);
        })
    });
}

exports.positionMascota = function (data, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        if (data.id == null) {
            data.id = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        var obj = {id: data.id};
        var query = JSON.stringify(obj);
        dbo.collection("mascotas").find(JSON.parse(query)).toArray(function (err, result) {
            if (err) throw err;
            var position = '{"lat":' + data.lat + ',"lon":' + data.lon + '}';
            if (result.length === 1) {
                if (result[0].hasOwnProperty('position')) {
                    var array = result[0].position;
                    array.push(position);
                    dbo.collection('mascotas').updateOne({"id": data.id}, {$set: {position: array}}, function (err, res) {
                        if (err) throw err;
                        callback('Correct');
                        db.close();
                    });
                } else {
                    console.log('No se ha registrado');
                }
            } else {
                console.log('incorrecto');
            }
        });

    });
};

//                        A D M I N

//insertar nueva mascota admin
exports.insertar = function (datos, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        let dbo = db.db('MascotaSegura');
        dbo.collection("mascotas").insertOne(JSON.parse(datos), function (err, res) {
            if (err) throw err;
            callback('Correcto');
            db.close();
        });
    });
};


//Se pierde la placa
exports.setPerdida = function (ver, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        console.log(ver.result);
        let dbo = db.db('MascotaSegura');
        if (ver.id == null || ver.pass == null) {
            ver = 'sdafnasldfnasdnlfasndfmxiwajcgr 17qt34wuceghrbs8q7nwu';
        }
        dbo.collection('mascotas').updateOne({id: ver.id, pass: ver.pass}, {
            $set: {
                placaPerdida: ver.result,
            }
        }, function (err, res) {
            if (err) throw err;
            callback(res);
            db.close();
        });
    });
}

exports.search = function (predictivo, option, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        let dbo = db.db("MascotaSegura");
        let query;

        if (option === '1') {
            query = {id: "" + predictivo + ""};
        } else if (option === '2') {
            query = {num: "" + predictivo + ""};
        }

        if (predictivo === "") {
            query = "";
        }

        dbo.collection("mascotas").find(query).limit(30).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};


//Busqueda para mostrar mascota
exports.buscarMascota = function (callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        dbo.collection("mascotas").find({}, {projection: {_id: 0, pass: 0}}).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};

//buscarTodos
exports.buscarTodos = function (callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        dbo.collection("mascotas").find().sort({name: -1}).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};

exports.buscarTodosLimit = function (limit, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        dbo.collection("mascotas").find().limit(limit).sort({name: -1}).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};

exports.subirDB = function (data, callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        dbo.collection("mascotas").insertMany(JSON.parse(data), function (err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            db.close();
        });
    });
};

exports.getAllPets = function (callback) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MascotaSegura");
        dbo.collection('mascotas').find({}).toArray(function (err, result) {
            if (err) throw err;
            callback(result);
            db.close();
        });
    });
};
