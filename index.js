const express = require('express'); 
const bodyParser = require('body-parser');
let mysql = require('mysql');

const app = express();

const port = 10101;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public/', express.static('public'));


app.get('/', (req, res) => {
    // res.json('Conexión establecida correctamente')
    res.render('index')
})

app.listen(port, () =>{
    console.log(`Conexión establecida en el puerto: ${port}`);
})

const pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'root',
    password        : '1234',
    database        : 'modulos',
    debugger        : false
})

app.get('/test', (req, res) => {
    pool.query('select * from usuario', function (error, results, fields){
        if (error) throw error
        let correo          = results[0].correo;
        let nombre          = results[0].nombre;
        let apellido        = results[0].apellido;
        let edad            = results[0].edad;
        let telefono        = results[0].telefono;

        res.send(`Datos del usuario: ${correo}, ${nombre}, ${apellido}, ${edad}, ${telefono}`)
    })
})
