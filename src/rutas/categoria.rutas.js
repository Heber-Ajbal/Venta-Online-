'use strict'

var express = require('express');
var categoriaControlador = require('../controladores/categoria.controlador');

//IMPORTACION DE MIDDLEWARE
 
var md_autorizacion = require("../middlewares/authenticated")

//RUTAS

var api = express.Router()

api.post('/AgregarCategoria', md_autorizacion.ensureAuth, categoriaControlador.agregarCategoria);
api.get('/MostrarCategorias', categoriaControlador.MostrarCategorias);
api.put('/EditarCategoria/:id', md_autorizacion.ensureAuth, categoriaControlador.EditarCategoria)
api.delete('/EliminarCategoria/:id',md_autorizacion.ensureAuth, categoriaControlador.EliminarCategoria);
api.get('/ProductoPorCategoria',md_autorizacion.ensureAuth, categoriaControlador.BucarCategoria)

module.exports = api

