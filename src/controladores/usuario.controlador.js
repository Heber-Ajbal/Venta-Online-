'use strict'

var Usuario = require('../modelos/usuario.modelo');
var Factura = require('../modelos/factura.modelo')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../servicios/jwt')
var ComprasRecientes = require("../controladores/factura.controlador")
const { model } = require('mongoose');

function Admin(req, res) {
    var userModel = new Usuario();

    userModel.nombre = 'ADMIN';
    userModel.password = '123456';
    userModel.rol = 'ROL_ADMIN'

    Usuario.find({

        $or: [
            { nombre: userModel.nombre }
        ]

    }).exec((err, adminEncontrado) => {
        if (err) return console.log('Error al crear el Admin');

        if (adminEncontrado.length >= 1) {

            return console.log("El admin ya se creo")

        } else {
            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {

                userModel.password = passwordEncriptada;


                userModel.save((err, adminGuardado) => {

                    if (err) return console.log('error en la peticion del Admin')

                    if (adminGuardado) {
                        console.log('Admin Creado ')

                    } else {
                        console.log('Error al crear el Admin')
                    }
                })
            })
        }
    })
}

function AgregarUsuario(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un Usuario' })
    }

    if (params.nombre && params.password) {

        usuarioModel.nombre = params.nombre,
            usuarioModel.rol = 'ROL_CLIENTE',

            Usuario.find({

                $or: [

                    { nombre: params.nombre },

                ]


            }).exec((err, UsuarioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {
                    return res.status(500).send({ mensaje: 'El usuario ya existe' })

                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {

                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usurioGuardado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error al guardar el usuario' })

                            if (usurioGuardado) {
                                return res.status(500).send({ usurioGuardado })

                            } else {
                                return res.status(500).send({ mensaje: 'no se ha podido registrar el usuario' })
                            }
                        })
                    })
                }


            })

    } else {
        return res.status(500).send({ mensaje: 'llene todos los parametros necesarios' })
    }


}

function login(req, res) {

    var params = req.body;
    var facturasRecientes;
    var vacio;
    var idFactura;

    Usuario.findOne({ nombre: params.nombre }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        idFactura = usuarioEncontrado._id;

        if (usuarioEncontrado) {
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                if (passVerificada) {
                    if (params.getToken === 'true') {

                        ///BUSCAR LAS FACTURAS DEL USUARIO
                        Factura.find({ usuario: idFactura }, { _id: 0, compras: { _id: 0 } }).exec((err, FacturaEncontrada) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            facturasRecientes = FacturaEncontrada;
                            if (!FacturaEncontrada) return res.status(500).send({ mensaje: 'Aun no ha realizado compras recientemente' });
                            Factura.findOne({ usuario: idFactura }, (err, FacturaEncontradax) => {

                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                                if (FacturaEncontradax === null) {
                                    vacio = 'Aun no ha realizado una compra'
                                    facturasRecientes = vacio
                                }




                                if (usuarioEncontrado.rol === 'ROL_CLIENTE') {

                                    return res.status(200).send({
                                        token: jwt.createToken(usuarioEncontrado), Compras: facturasRecientes

                                    })


                                } else {
                                    return res.status(200).send({
                                        token: jwt.createToken(usuarioEncontrado)
                                    })
                                }

                            })



                        })

                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'El usuario no se a podido indentificar' })
                }

            })
        } else {
            return res.status(500).send({ mensaje: 'Error al buscar el Usuario' })
        }
    })

}

function modificarRol(req, res) {
    var params = req.body;
    var idUsuario = req.params.id

    delete params.password;
    delete params.nombre;

    if (req.user.rol = ! 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para modificar el rol' })
    }

    if (params.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'Solamente puede ser ROL_ADMIN' })
    }


    Usuario.findOne({ _id: idUsuario }, (err, UsuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (UsuarioEncontrado.rol === 'ROL_ADMIN') return res.status(500).send({ mensaje: 'No posee el permiso para editar el rol de este usuario' })

        Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

            if (!usuarioActualizado) return res.status(500).send({ mensaje: 'El usuario no esta registrado' })


            if (usuarioActualizado) {
                return res.status(200).send({ usuarioActualizado });
            }

        })

    })




}

function EditarUsuario(req, res) {
    var params = req.body;
    var idUsuario = req.params.id;

    delete params.password;
    delete params.rol;

    if (req.user.rol != 'ROL_CLIENTE') {

        if (req.user.rol != 'ROL_ADMIN') {
            return res.status(500).send({ mensaje: 'No posee los permisos para editar un usuario' })
        }
    }

    Usuario.find({ nombre: params.nombre }).exec((err, UsuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });



        if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe ' })
        } else {

            Usuario.findOne({ _id: idUsuario }).exec((err, usuarioEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'No existen los datos' });

                if (usuarioEncontrado.rol != 'ROL_CLIENTE') {
                    return res.status(500).send({ mensaje: 'No posee el permiso para editar este Usuario' })
                }

                if (req.user.rol === 'ROL_ADMIN') {
                    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se ha podido editar el usuario' });

                        if (usuarioActualizado) return res.status(200).send({ usuarioActualizado })
                    })
                } else {

                    if (req.user.sub != idUsuario) return res.status(500).send({ mensaje: 'No pude editar a un usuario ajeno' })
                    Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

                        if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se ha podido editar el usuario' });

                        if (usuarioActualizado) return res.status(200).send({ usuarioActualizado })
                    })
                }

            })


        }
    })
}

function eliminarUsuario(req, res) {
    var idUsuario = req.params.id

    if (req.user.rol != 'ROL_CLIENTE') {
        if (req.user.rol != 'ROL_ADMIN') {
            return res.status(500).send({ mensaje: 'No posee los permisos para eliminar un usuario' })
        }

    }

    Usuario.findOne({ _id: idUsuario }).exec((err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' })
        if(usuarioEncontrado.rol === 'ROL_ADMIN')  return res.status(500).send({ mensaje: 'No posee el permiso para eliminar este Usuario' })

        if(req.user.rol === 'ROL_ADMIN'){
            Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!usuarioEliminado) return res.status(500).send({ mensaje: 'No se ha podido eliminar el usuario' });
                // if(usuarioEliminado.rol =! 'ROL_CLIENTE') return res.status(500).send({mensaje:'No posee los permisos para eliminar este usuario'});
    
                if (usuarioEliminado) return res.status(200).send({ mensaje: 'Se ha eliminado el usuario' })
            })

        }else{
            if(req.user.sub != idUsuario) return res.status(500).send({ mensaje: 'No pude eliminar a un usuario ajeno' })
            Usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!usuarioEliminado) return res.status(500).send({ mensaje: 'No se ha podido eliminar el usuario' });
                // if(usuarioEliminado.rol =! 'ROL_CLIENTE') return res.status(500).send({mensaje:'No posee los permisos para eliminar este usuario'});
    
                if (usuarioEliminado) return res.status(200).send({ mensaje: 'Se ha eliminado el usuario' })
            })
            
        }
       

       

    })


}



module.exports = {
    Admin,
    AgregarUsuario,
    login,
    modificarRol,
    EditarUsuario,
    eliminarUsuario,
    
}