const mongoose = require("mongoose");
const app = require("./app");
var controladorAdmin = require("./src/controladores/usuario.controlador")

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/VentaOnline2019010', {useNewUrlParser: true, useUnifiedTopology:true}).then(()=>{

    console.log('Se encuentra conectado a la base de datos');

    controladorAdmin.Admin();

    app.listen(3000,function(){

        console.log('El servidor esta arrancando en el puerto 3000')
    })    

}).catch(err => console.log(err));