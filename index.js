const express = require('express'); 
let mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public/', express.static('./public'));

const port = 10101;

const pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'root',
    password        : '1234',
    database        : 'modulos',
    debug        : false
});

app.get('/', (req, res) => {
    // res.json('Conexión establecida correctamente')
    res.render('index')
});

app.get('/registro-interfaz', (req, res) => {
    res.render('registro')
});

app.post('/registro', (req, res) => {
    let correo = req.body.correo;
    let nombres = req.body.nombres;
    let apellidos = req.body.apellidos;
    let contrasenia = req.body.contrasenia;
    let edad = req.body.edad;
    let telefono = req.body.telefono;

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);

    const hash = bcrypt.hashSync(contrasenia, salt);
    pool.query("insert into usuario values (?,?,?,?,?,?)", [correo, nombres, apellidos, hash, edad, telefono],

    (error) => {
        if(error) throw error;
        // res.send('Registro éxitoso');
        res.render('login');
    });
});

app.get('/login-interfaz', (req, res) => {
    res.render('login')
});

app.post('/login', (req, res) => {

    let correo          = req.body.correo;
    let contrasenia     = req.body.contrasena;

    pool.query("select contrasenia from usuario where correo= ?", [correo], (error, data) => {

        if (error) throw error;

        if (data.length > 0){
            let contraseniaEncriptada = data[0].contrasenia;

            if(bcrypt.compareSync(contrasenia, contraseniaEncriptada)){
                return res.send('Login exitoso')
                // res.render('index')
            }
            return res.send('Usuario o contraseña incorrecto');
            // return res.render('registro')
        }
        return res.send('Usuario o contraseña incorrecto');
        // return res.render('registro')
    })
})

app.listen(port, () =>{
    console.log(`Conexión establecida en el puerto: ${port}`);
});

// app.get('/test', (req, res) => {
//     pool.query('select * from usuario', function (error, results, fields){
//         if (error) throw error
//         let nombres         = results[0].nombres;
//         let apellidos       = results[0].apellidos;
//         let correo          = results[0].correo;
//         let contrasenia     = results[0].contrasenia;
//         let edad            = results[0].edad;
//         let telefono        = results[0].telefono;

//         res.send(`Datos del usuario: ${nombres}, ${apellidos}, ${correo}, ${contrasenia}, ${edad}, ${telefono}`)
//     })
// })


