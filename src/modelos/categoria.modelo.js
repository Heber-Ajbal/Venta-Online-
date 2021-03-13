'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({

    nombre: String

})

module.exports = mongoose.model('categorias',CategoriaSchema);