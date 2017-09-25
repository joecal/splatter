const express = require('express');
const app = express();
const path = require('path');
const compression = require('compression')
const port = process.env.PORT || 3000;

app.use(compression())

app.use(express.static(path.join(__dirname, './src')));

app.set('port', port);

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
})

app.listen(port, () => {
  console.log('Listening to port:  ' + port);
});
