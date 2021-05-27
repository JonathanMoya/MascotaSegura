'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PettSchema = Schema({
    id: {type: Number},
    nombre: {type: String, default: null},
    raza: {type: String, default: null},
    color: {type: String, default: null},
    descripcion: {type: String, default: null},
    direccion: {type: String, default: null},
    telefono: {type: Number, default: 0},
    celular1: {type: Number, default: 0},
    celular2: {type: Number, default: 0},
    medico: {type: String, default: null},
    correo: {type: String, default: null},
    estado: {type: Boolean, default: false},
    amo: String
});


module.exports = mongoose.model('Pet', PettSchema);

