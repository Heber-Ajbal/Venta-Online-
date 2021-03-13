'use strict'

const { find } = require("../modelos/producto.modelo");
var Producto = require("../modelos/producto.modelo");

function agregarProducto(req, res) {

    var productoModel = new Producto()
    var params = req.body;

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un producto' })
    }

    delete params.ventas;

    if (params.nombre && params.stock) {

        productoModel.nombre = params.nombre
        productoModel.stock = params.stock
        productoModel.ventas = 0
        productoModel.categoriaProducto = req.params.id;

        Producto.find({ nombre: params.nombre }).exec((err, productoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })

            if (productoEncontrado && productoEncontrado.length >= 1) {
                return res.status(500).send({ mensaje: 'El producto ya existe' })

            } else {

                productoModel.save((err, productoGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar el producto' })

                    if (productoGuardado) {
                        return res.status(200).send({ productoGuardado })
                    } else {
                        return res.status(500).send({ mensaje: 'Error al guardad el producto' })
                    }

                })
            }
        })

    } else {
        return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })

    }

}

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar un producto' })

    }

    delete params.ventas
    delete params.categoriaProducto

    Producto.find({ nombre: params.nombre }).exec((err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' })

        if (productoEncontrado && productoEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe' })

        } else {
            Producto.findByIdAndUpdate(idProducto, params, { new: true }, (err, productoActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error al actualizar el producto' })
                if (!productoActualizado) return res.status({ mensaje: 'No se han encontrado los datos' })
                if (productoActualizado) return res.status(200).send({ productoActualizado })

            })

        }

    })


}

function EliminarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body;

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee el permiso para eliminar un producto' })

    }

    Producto.findByIdAndDelete(idProducto, (err, productoEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!productoEliminado) return res.status(500).send({ mensaje: 'No existen los datos' })
        if (productoEliminado) return res.status(200).send({ mensaje: 'Producto Eliminado' })
    })

}

function mostrarProductos(req, res) {
    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee permiso para ver los productos' })
    }

    Producto.find().exec((err, productosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!productosEncontrados) return res.status(500).send({ mensaje: 'aun no hay productos' });

        if (productosEncontrados) return res.status(200).send({ productosEncontrados })
    })
}

function nombreProducto(req, res) {

    var params = req.body

    if (params.nombre) {
        Producto.findOne({ nombre: params.nombre }).exec((err, productoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto que busca no existe' })

            if (productoEncontrado) return res.status(200).send({ productoEncontrado })
        })

    } else {
        return res.status(500).send({ mensaje: 'Llene todos los parametos necesarios' })
    }


}

function productosAgotados(req, res) {

    var stock2 = 0
    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee el permisos para ver los productos agotados' })
    }


    Producto.find({ stock: stock2 },{_id:0,ventas:0, categoriaProducto:0}).exec((err, productoAgotado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!productoAgotado) return res.status(500).send({ mensaje: 'No hay ningun producto agotado' })
        if (productoAgotado) return res.status(200).send({ productoAgotado })
    })

}

function masVendido(req, res) {

    Producto.find({
        ventas: { $gt: 4 }
    }, {
        _id: 0, stock: 0, categoriaProducto: 0, __v: 0
    }).sort({ ventas: -1 }).limit(5).exec((err, productosMasVendidos) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productosMasVendidos) return res.status(500).send({ mensaje: 'Aun no hay productos con una venta mayor a 5' })
        if (productosMasVendidos) return res.status(200).send({ productosMasVendidos })
    })
}




module.exports = {

    agregarProducto,
    editarProducto,
    EliminarProducto,
    mostrarProductos,
    nombreProducto,
    productosAgotados,
    masVendido

}