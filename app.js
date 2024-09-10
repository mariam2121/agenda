const express = require('express');
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const bcrypt = require('bcrypt');
const { findOne } = require('./models/Usuario');
const salt = 10; 
const uri = "mongodb+srv://user:user@cluster0.lhs5g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();
const PORT = 5000;


app.use(express.json());

mongoose.connect(uri)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

//total de usuario
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error al obtener usuarios');
  }
});

//agregar usuario 
app.post('/agregarusuario', async (req, res) => {
  const { nombre, contraseña } = req.body;
  bcrypt.hash(contraseña, salt, function(err, hash) {
    const nuevoUsuario = new Usuario({
      nombre : nombre,
      contraseña: hash
    });
    nuevoUsuario.save();
    res.status(201).send('Usuario agregado exitosamente');

    });
});

//modificar usuario (algo especifico)
app.patch('/modificarusuario/:nombre', async (req, res) => {
  const { nombre } = req.params;
  const { nuevoNombre, contraseña } = req.body;
  try {
    const userModi = await Usuario.findOne({ nombre: nombre });
    if (!userModi) {
      return res.status(404).send('Usuario no encontrado');
    }
    if (nuevoNombre) {
      userModi.nombre = nuevoNombre;
    }
    if (contraseña) {
      const salt = await bcrypt.genSalt(10);
      userModi.contraseña = await bcrypt.hash(contraseña, salt);
    }
    await userModi.save();
    res.status(200).send('Usuario modificado exitosamente');
  } catch (error) {
    res.status(500).send('Error al modificar el usuario');
  }
});

//eliminar usuario
app.delete('/eliminarusuario/:nombre', async (req, res) => {
  const { nombre } = req.params; 
  try {
    const userDelete = await Usuario.findOneAndDelete({ nombre: nombre });
    if (!userDelete) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.status(200).send('Usuario eliminado exitosamente');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el usuario');
  }
});



//login
app.post('/login', async (req, res) =>{
  const {nombre,contraseña} = req.body
  const user = await Usuario.findOne({nombre : nombre})
  if(!user){
    res.status(404).send('usuario no encontrado')
  }
  else{
    bcrypt.compare(contraseña, user.contraseña, (err, result) => {
    if(user){
      res.status(200).send('usuario encontrado')
    }

});
}
})


  

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
