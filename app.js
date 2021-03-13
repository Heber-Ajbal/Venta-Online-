'use strict'

//VARIABLES GLOBALES

const express = require("express");
const app = express();
const bodyParser = require("body-parser");


//IMPORTACION DE RUTAS
var usuario_rutas = require("./src/rutas/usuario.rutas");
var categoria_rutas = require("./src/rutas/categoria.rutas")
var producto_rutas = require("./src/rutas/producto.rutas")
var factura_rutas = require("./src/rutas/factura.ruta")

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//APLICACIONES DE LA RUTA
app.use('/api', usuario_rutas, categoria_rutas, producto_rutas, factura_rutas);


//EXPORTACIONES 
module.exports = app

