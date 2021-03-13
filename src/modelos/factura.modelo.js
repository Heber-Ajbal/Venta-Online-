'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var FacturaSchema = Schema({

    usuario: {type: Schema.Types.ObjectId, ref:'usuarios'},
    
    compras: [{

        compraProducto: {type: Schema.Types.ObjectId, ref:'productos'},
        nombre: String,
        cantidad: Number

    }]


     
})

module.exports = mongoose.model('facturas', FacturaSchema)