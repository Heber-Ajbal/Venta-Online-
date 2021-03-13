'use strict'
const { Router } = require("express");
var express = require("express");
var usuarioControlador = require("../controladores/usuario.controlador");

//MIDDLEWARES

var md_autorizacion = require("../middlewares/authenticated");

//RUTAS 

var api = express.Router();

api.post('/AgregarUsuario',md_autorizacion.ensureAuth, usuarioControlador.AgregarUsuario)
api.post('/login', usuarioControlador.login)
api.put('/ModificarRol/:id', md_autorizacion.ensureAuth, usuarioControlador.modificarRol)
api.put('/EditarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.EditarUsuario)
api.delete('/EliminarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario)


module.exports = api;