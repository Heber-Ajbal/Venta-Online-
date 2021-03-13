'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var ProductoSchema = Schema({

    nombre: String,
    stock: Number,
    ventas: Number,
    categoriaProducto:{type: Schema.Types.ObjectId, ref:'categorias'}
})

module.exports = mongoose.model('productos',ProductoSchema)