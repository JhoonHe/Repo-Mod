const express = require('express');
const app = express();
const port = 10101;

app.get('/', (req, res) => {
    res.send('Conexión establecida correctamente')
})

app.listen(port, () =>{
    console.log(`Conexión establecida en el puerto: ${port}`);
})