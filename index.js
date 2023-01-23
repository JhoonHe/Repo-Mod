const express = require('express'); 
let mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const app = express();

app.use(cookieParser());

const timeExp = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "rfghf66a76ythggi87au7td",
    saveUninitialized: true,
    cookie: { maxAge: timeExp },
    resave: false
}));

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
    let session = req.session;

    if(session.correo){
        return res.render('index', {nombres: session.nombres});
    } 
    return res.render('index', {nombres: undefined});
});

app.get('/registro-interfaz', (req, res) => {
    return res.render('registro')
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
        return res.redirect('/login-interfaz');
    });
});

app.get('/login-interfaz', (req, res) => {
    return res.render('login')
});

app.post('/login', (req, res) => {

    let correo          = req.body.correo;
    let contrasenia     = req.body.contrasena;

    pool.query("select contrasenia, nombres, apellidos from usuario where correo= ?", [correo], (error, data) => {

        if (error) throw error;

        if (data.length > 0){
            let contraseniaEncriptada = data[0].contrasenia;

            if(bcrypt.compareSync(contrasenia, contraseniaEncriptada)){
                // res.render('index')
                let session = req.session;

                session.correo = correo;

                session.nombres = `${data[0].nombres}`

                return res.redirect('/');
            }
            return res.send('Usuario o contraseña incorrecto');
            // return res.render('registro')
        }
        return res.send('Usuario o contraseña incorrecto');
        // return res.render('registro')
    })
});

app.get('/logout', (req, res) => {
    
    let session = req.session;

    if(session.correo){
        req.session.destroy();
        
        return res.redirect('/');
    } else {
        return res.send("Por favor inicie sesión")
    }
});

app.listen(port, () =>{
    console.log(`Conexión establecida en el puerto: ${port}`);
});

// Test

app.get('/test', (req, res) => {
    pool.query('select * from usuario', function (error, results, fields){
        if (error) throw error
        let nombres         = results[0].nombres;
        let apellidos       = results[0].apellidos;
        let correo          = results[0].correo;
        let contrasenia     = results[0].contrasenia;
        let edad            = results[0].edad;
        let telefono        = results[0].telefono;

        res.send(`Datos del usuario: ${nombres}, ${apellidos}, ${correo}, ${contrasenia}, ${edad}, ${telefono}`)
    })
})

app.get('/test-cookies', (req, res) => {

    let session = req.session;

    if (session.correo){
        res.send(`Usted tiene una sesion iniciada con el siguiente correo: ${session.correo}`);
    }else{
        res.send('Por favor inicie sesión')
    }
});