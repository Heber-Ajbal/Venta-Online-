'use strict'

var express = require("express");
var productoControlador = require("../controladores/producto.controlador")

// MIDDLEWARES

var md_autorizacion = require("../middlewares/authenticated");

//RUTAS

var api = express.Router()

api.post('/AgregarProducto/:id', md_autorizacion.ensureAuth, productoControlador.agregarProducto)
api.put('/EditarProducto/:id', md_autorizacion.ensureAuth, productoControlador.editarProducto)
api.delete('/EliminarProducto/:id', md_autorizacion.ensureAuth, productoControlador.EliminarProducto)
api.get('/MostarProductos',md_autorizacion.ensureAuth, productoControlador.mostrarProductos)
api.get('/Producto', productoControlador.nombreProducto);
api.get('/productoAgotado',md_autorizacion.ensureAuth, productoControlador.productosAgotados)
api.get('/ProductoMasVendido', productoControlador.masVendido)

module.exports = api