'use strict'

var express = require('express')
var facturaControlador = require('../controladores/factura.controlador')

//MIDDLEWARES

var md_autorizacion = require("../middlewares/authenticated");

//RUTAS 

var api = express.Router();

api.put('/CarridoDeCompra',md_autorizacion.ensureAuth, facturaControlador.carritoCompra);
api.get('/MostrarFacturas/:id', md_autorizacion.ensureAuth,facturaControlador.MostrarFacturas);
api.get('/MostarProducto/:id', md_autorizacion.ensureAuth, facturaControlador.MostarProductosF)

module.exports = api