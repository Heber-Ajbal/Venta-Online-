'use strict'


var Categoria = require("../modelos/categoria.modelo");
var Producto = require("../modelos/producto.modelo");
var idDef;


function agregarDef(req, res) {

    var categoriaModel = new Categoria();

    categoriaModel.nombre = 'Default'

    Categoria.find({ nombre: categoriaModel.nombre }).exec((err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
            return ('La categoria ya existe')
        } else {

            categoriaModel.save((err, categoriaGuardada) => {
                if (err) console.log('Error al guardar la categoria');
                if (categoriaGuardada) {
                    console.log('Categoria Default creada')
                } else {

                    console.log('No se ha podido guardad la categoria')

                }

            })
        }
    })


}

function buscarDef(req, res) {
    Categoria.findOne({ nombre: 'Default' }).exec((err, categoriaEncontrado) => {
        if (err) console.log('Error en la peticion')
        if (!categoriaEncontrado) {
            return ('El producto que busca no existe')
        } else {
            idDef = categoriaEncontrado._id;
        }



    })
}

function agregarCategoria(req, res) {
    agregarDef();
    buscarDef()
    var categoriaModel = new Categoria();
    var params = req.body;

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar una Categoria' })
    }

    if (params.nombre) {

        categoriaModel.nombre = params.nombre

        Categoria.find({ nombre: params.nombre }).exec((err, categoriaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
                return res.status(500).send({ mensaje: 'La categoria ya existe' })
            } else {

                categoriaModel.save((err, categoriaGuardada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error al guardar la categoria' });
                    if (categoriaGuardada) {
                        return res.status(200).send({ categoriaGuardada })
                    } else {

                        return res.status(500).send({ mensaje: 'No se ha podido guardad la categoria' })

                    }

                })
            }
        })

    } else {
        return res.status(500).send({ mensaje: 'ingrese los parametros necesarios' })
    }

}

function MostrarCategorias(req, res) {

    Categoria.find().exec((err, Categoria) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!Categoria) return res.status(500).send({ mensaje: 'No existe ninguna categoria' })
        if (Categoria) return res.status(200).send({ Categoria })
    })

}

function EditarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar la categoria' })
    }

    Categoria.find({ nombre: params.nombre }).exec((err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })


        if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe' })
        } else {
            Categoria.findOne({ _id: idCategoria }).exec((err, categoriaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'error en la peticion al obtener el empleado' });

                if (!categoriaEncontrada) return res.status(500).send({ mensaje: 'Error en la peticion editar o no existen los datos' });

                if (categoriaEncontrada.nombre === 'Default') return res.status(500).send({ mensaje: 'no posee permiso para editar esta categoria' })


                Categoria.findByIdAndUpdate(idCategoria, params, { new: true }, (err, categoriaActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

                    if (!categoriaActualizado) return res.status(500).send({ mensaje: 'no se ha podido editar el empleado' })


                    if (categoriaActualizado) {
                        return res.status(200).send({ categoriaActualizado });
                    }

                })

            })

        }
    })


}

function EliminarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body
    buscarDef()

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee el permiso para eliminar categorias' })
    }

    Categoria.findOne({ _id: idCategoria }).exec((err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!categoriaEncontrada) return res.status(500).send({ mensaje: 'Los datos no existen' })
        if (categoriaEncontrada.nombre === 'Default') return res.status(500).send({ mensaje: 'No posee permiso para eliminar la categoria Default' })


        //PASAR EL PRODUCTO A UNA CATEGORIA DEFAULT

        Producto.updateMany({ categoriaProducto: idCategoria }, { $set: { categoriaProducto: idDef } }, { multi: true }, (err, productoActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error al actualizar el producto' })
            if (!productoActualizado) return res.status({ mensaje: 'No se han encontrado los datos' })


        })

        // ELIMINAR LA CATEGORIA
        Categoria.findByIdAndDelete(idCategoria, (err, categoriaEliminada) => {
            if (err) return res.status(500).send({ mensaje: 'Error al eliminar la categoira' })
            if (!categoriaEliminada) return res.status(500).send({ mensaje: 'los datos no existen' })

            if (categoriaEliminada) return res.status(200).send({ mensaje: 'La categoria ha sido eliminada' })
        })




    })

}

function BucarCategoria(req, res) {

    var idCategoria;
    var params = req.body
    if (req.user.rol != 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: 'No posee el permiso de buscar los productos por categoria' })
    }

    if (!params.nombre) return res.status(500).send({ mensaje: 'Agrege los parametros necesarios' })

    Categoria.findOne({ nombre: params.nombre }).exec((err, categoriaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!categoriaEncontrada) return res.status(500).send({ mensaje: 'La categoria que busca no existe' });
        idCategoria = categoriaEncontrada._id

        Producto.find({ categoriaProducto: idCategoria }).exec((err, ProductoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!ProductoEncontrado) return res.status(500).send({ mensaje: 'no hay productos existentes' });
            if (ProductoEncontrado) return res.status(200).send({ ProductoEncontrado })
        })
    })

}


module.exports = {
    agregarCategoria,
    MostrarCategorias,
    EditarCategoria,
    EliminarCategoria,
    BucarCategoria
}