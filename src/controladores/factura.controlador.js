'use strict'

var Factura = require('../modelos/factura.modelo');
var Producto = require('../modelos/producto.modelo');
var Usuario = require('../modelos/usuario.modelo')
var facturaId;
var productoId;
var stockP = 0;
var venta = 0
var totalS = 0
var totalV = 0;


function carritoCompra(req, res) {
    var idCliente = req.user.sub;
    var facturaModel = new Factura()
    var params = req.body;
    var nombreP;

    if (req.user.rol != 'ROL_CLIENTE') {
        return res.status(500).send({ mensaje: 'No puede comprar un producto' })
    }


    if (params.nombre && params.cantidad) {


        if (params.pagar != 'Comprar'){            
            if (params.pagar != 'AgregarCarrito'){            
                if (params.pagar != 'Finalizar'){            
                    return res.status(500).send({mensaje:'Error en el parametro Pagar, Solo puede agregar Finalizar, Comprar o AgregarCarrito'})
                    
                }
            }  
        }


        if (params.pagar === 'Finalizar') {
            Factura.findById(facturaId, (err, FacturaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!FacturaEncontrada) return res.status(500).send({ mensaje: 'Aun no realiza una compra' })
                facturaId = null;
                return res.status(200).send({ FacturaEncontrada })
            })

        }

        if (params.pagar === 'Comprar') {


            Producto.findOne({ nombre: params.nombre }).exec((err, productoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto que busca no existe' })
                productoId = productoEncontrado._id
                nombreP = productoEncontrado.nombre
                parseInt(stockP = productoEncontrado.stock)
                parseInt(venta = productoEncontrado.ventas)

                if (stockP < params.cantidad) {
                    return res.status(500).send({ mensaje: 'La cantidad que desea es mayor al stock' })
                } else {
                    //if(productoEncontrado) return res.status(200).send({productoId})

                    facturaModel.usuario = idCliente,
                        facturaModel.compras = {
                            compraProducto: productoId,
                            nombre: nombreP,
                            cantidad: params.cantidad

                        }

                    facturaModel.save((err, facturaGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (!facturaGuardada) return res.status(500).send({ mensaje: 'Error al guardar la factura' })

                        facturaId = facturaGuardada._id

                        /// RESTAR STOCK Y AUMENTAR LA VENTA
                        totalS = stockP - params.cantidad;
                        totalV = parseInt(venta) + parseInt(params.cantidad)

                        Producto.update({ _id: productoId }, {
                            $set: {
                                stock: totalS,
                                ventas: totalV
                            }
                        }, { new: true }, (err, productoAtualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'EL producto no se actualizo' });
                            if (!productoAtualizado) return res.status(500).send({ mensaje: 'NO existe el producto xdxdxd' })

                            if (facturaGuardada) return res.status(200).send({ facturaGuardada })
                        })



                    })
                }
            })


        } else if (params.pagar === 'AgregarCarrito') {

            if (stockP < params.cantidad) {
                return res.status(500).send({ mensaje: 'La cantidad que desea es mayor al stock' })
            } else {

                Producto.findOne({ nombre: params.nombre }).exec((err, productoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (!productoEncontrado) return res.status(500).send({ mensaje: 'El producto que busca no existe' })
                    productoId = productoEncontrado._id
                    nombreP = productoEncontrado.nombre
                    parseInt(stockP = productoEncontrado.stock)
                    parseInt(venta = productoEncontrado.ventas)


                    Factura.findByIdAndUpdate(facturaId, {

                        $push: {

                            compras: {
                                compraProducto: productoId,
                                nombre: nombreP,
                                cantidad: params.cantidad
                            }
                        }
                    }, { new: true }, (err, comprasAgregadas) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (!comprasAgregadas) return res.status(500).send({ mensaje: 'Para comprar un  solo producto = Comprar  y AgregarCarrito para agregar mas productos a su Compra' })



                        /// RESTAR STOCK Y AUMENTAR LA VENTA
                        totalS = stockP - params.cantidad;
                        totalV = parseInt(venta) + parseInt(params.cantidad);
                        Producto.update({ _id: productoId }, {
                            $set: {
                                stock: totalS,
                                ventas: totalV
                            }
                        }, { new: true }, (err, productoAtualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'EL producto no se actualizo' });
                            if (!productoAtualizado) return res.status(500).send({ mensaje: 'NO existe el producto xdxdxd' })

                            if (!comprasAgregadas) return res.status(200).send({ comprasAgregadas })

                            return res.status(200).send({ comprasAgregadas })
                        })




                    })
                })
            }
        }

    } else {
        return res.status(500).send({ mensaje: 'Llene todos los parametos necesarios' })
    }

}

function MostrarFacturas(req, res) {
    var idusuario = req.params.id

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee el permiso para ver las facturas' })
    }

    Factura.find({ usuario: idusuario }, (err, FacturaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!FacturaEncontrada) return res.status(500).send({ mensaje: 'No tiene ninguna Factura' })
        Factura.findOne({ usuario: idusuario }, (err, FacturaEncontradax) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!FacturaEncontradax) return res.status(500).send({ mensaje: 'No tiene ninguna Factura' })

            if (FacturaEncontrada) return res.status(200).send({ FacturaEncontrada })
        })


    })
}

function MostarProductosF(req, res) {

    var idFactura = req.params.id

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para ver la factura' })
    }

    Factura.findById(idFactura, { compras: { compraProducto: 0, _id: 0, cantidad: 0 }, usuario: 0 }, (err, FacturaEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!FacturaEncontrada) return res.status(500).send({ mensaje: 'La factura no existe' });
        if (FacturaEncontrada) return res.status(200).send({ FacturaEncontrada })
    })

}






module.exports = {

    carritoCompra,
    MostrarFacturas,
    MostarProductosF,


}