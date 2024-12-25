require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
let urls = [];

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res){
  // 1. verify valid url
  const { url } = req.body;
  let hostname = null;
  try{
    hostname = new URL(url)?.hostname;
  }catch{}
  if(!hostname){
    return res.json({ error: 'invalid url' });
  }
  dns.lookup(hostname, (err, addr)=>{
    if(err){
      console.error(err);
      return res.json({ error: 'invalid url' });
    };
    const index = urls.findIndex(item=>item.original_url === url);
    if(index === -1){
      const newItem = {
        short_url: (urls[urls.length - 1]?.short_url ?? 0) + 1,
        original_url: url
      };
      urls.push(newItem);
      return res.json(newItem);
    }
    return res.json(urls[index]);
  });
});

app.get('/api/shorturl/:id', (req, res)=>{
  if(urls.length > 0){
    try{
      const url = urls.find(item=>item.short_url === parseInt(req.params.id));
      if(url){
        return res.redirect(url.original_url);
      }
    }catch{}
    return res.redirect('/');
  }
  return res.redirect('/');
});

app.get('/api/shorturls', (req,res)=>{
  return res.json(urls);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
