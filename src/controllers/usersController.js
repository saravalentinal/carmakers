const path = require('path');
const fs = require('fs');
const {validationResult} = require('express-validator');
//cargar db Usuarios
const db = require('../../database/models')
//====
let usuarios = db.Usuario.findAll({raw: true,
    nest: true}).then(a => console.log(a))
console.log(usuarios)
//==================
const user = require('../modelos/users');
//JSON==============
const usersFilePath = path.join(__dirname, '../data/usuarios.json');
//var usuarios = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
//==================
let bcrypt = require('bcrypt');



const controlador ={
    index: (req, res) => {
        db.Usuario.findAll()
            .then(usuarios=> res.render('usuarios', {usuario: usuarios}))
    },
    
    login: (req, res) => {
        res.render('login')
    },

    processLogin: (req,res) => {
        db.Usuario.findOne(
            {where: {email: req.body.email}}
        ).then((resultado) => {
            if(resultado){
                if (bcrypt.compareSync(req.body.password, resultado.password)){
                    
                    let usuarioALoguearse = {
                        idUsuario: resultado.idUsuario,
                        nombres: resultado.nombres,
                        apellidos: resultado.apellidos,
                        email: resultado.email,
                        imgPerfil: resultado.imgPerfil,
                        is_admin: 0
                    };

                    delete resultado.password;
                    req.session.userLogged = usuarioALoguearse;

                    if(req.body.rememberMe){
                        res.cookie('userEmail', req.body.email, {maxAge: (1000 * 60) * 2})
                    }
                    
                    return res.redirect('profile');
                } else {
                    return res.render('login', {
                        errors: {
                            password: {
                                msg: 'La contraseña no es correcta'
                            }
                        }
                    })
                }

            }
        
            return res.render('login', {
                errors: {
                    email: {
                        msg: 'No existe una cuenta con esa dirección de correo electrónico'
                    }
                }
            })
        
        });

    },

    profile: (req, res) => {
        res.render('profile', {user: req.session.userLogged});
    },

    logout: (req,res) => {
        res.clearCookie('userEmail');
        req.session.destroy();
        return res.redirect('/');
    },

    register: (req, res) => {
        console.log('query vista ' + req.query.isAdmin);
        return res.render('register');
    },

    processRegister: (req, res) => {

        const resultValidation = validationResult(req);
        
        if(resultValidation.errors.length > 0) {
            return res.render('register', {errors: resultValidation.mapped(), oldData: req.body})
        }

        let queryAdmin = 0;
        if (req.params.isAdmin === '1') {
            queryAdmin = 1;
        }

        console.log('el query admin' + req.query.isAdmin);
        console.log('variable qeryadmin' + queryAdmin);

        db.Usuario.create({            
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            imgPerfil: req.file.filename,
            is_admin: queryAdmin});

		res.redirect('/users/login');
    },

    editarUsuario: (req, res) => {
        let idUsuario = req.params.idUsuario;
        db.Usuario.findByPk(idUsuario)
        .then(usuarios=> 
            {
                if (usuarios){res.render('editarUsuario', {"usuarioToEdit": usuarios}) }
                else{res.status(404).render('error')}
                
            })
        .then(resultado => {
            console.log(resultado)
        })
          
    },

/* actualizar CRUD Usuarios  Eliminar, Actualizar, */

    crear: (req, res) => {
		let nuevoUsuario = req.body;
        
        nuevoUsuario.id = usuarios[usuarios.length-1].id +1
		usuarios.push(nuevoUsuario)

		res.redirect('/users')
    }, 
/*
    editarUsuario: (req, res) => {
        let idUsuario = req.params.idUsuario;
        res.render('editarUsuario',{usuarioToEdit :usuarios.filter((usuario)=> usuario.id == idUsuario)[0] } )
    },
*/
    actualizar: (req, res)=>{
        let idUsuario = req.params.idUsuario;
        let infoForm = req.body;
        usuarios.forEach(element => {
            if(element.id == idUsuario){
                element.nombres = infoForm.nombres;
                element.apellidos = infoForm.apellidos;
                element.correoElectronico = infoForm.correoElectronico;
                element.password = infoForm.password;
            }
        });
        res.redirect('/users')
    },

    //eliminar usuario
    eliminarUsuario : (req, res) => {
		let idUsuario = req.params.idUsuario;
        db.Usuario.destroy({
            where:{idUsuario:idUsuario}
        })
		res.redirect('/users')
	},


}

// exportacion del modulo
module.exports = controlador;

