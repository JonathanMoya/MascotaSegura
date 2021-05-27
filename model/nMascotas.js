'use strict';
//Registro de las nuevas mascotas

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ownerSchema = Schema({
    nombre: String,
    password: String,
    pets: Number,
    email: String,
    products: String
});

module.exports = mongoose.model('Owner', ownerSchema);

