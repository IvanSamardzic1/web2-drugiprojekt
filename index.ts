import express from "express";
import fs from 'fs';
import https from 'https';
import path from "path";
import { Pool } from 'pg'
import { auth, requiresAuth } from 'express-openid-connect'; 
import dotenv from 'dotenv'
dotenv.config()

const externalUrl = process.env.RENDER_EXTERNAL_URL;

const app = express();

const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8000;
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const config = { 
  authRequired : false,
  idpLogout : true, 
  secret: process.env.SECRET,
  baseURL: externalUrl || `https://localhost:${port}`, 
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-h2nq1p48ta3mwij5.us.auth0.com',
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code' ,
    //scope: "openid profile email"   
   },
};

app.use(auth(config));

const pool = new Pool({   
  user: process.env.DB_USER,   
  host: process.env.DB_HOST,   
  database: 'projekt_baza',   
  password: process.env.DB_PASSWORD,   
  port: 5432,   
  ssl : true 
}) 




app.get("/", (req, res) => {
    res.render('index');
  });



app.get("/sqlumetanje", (req, res)=>{
  res.render('sqlumetanje');
  });

app.post("/submit", async function(req, res){
  const checkbox = req.body.myCheckbox;
  const upisaniOib = req.body.oib;

  if (checkbox === 'on'){
    const podatci = await pool.query(`SELECT * FROM popis WHERE oib = '${upisaniOib}'`);
    const rows = podatci.rows
    if (rows.length == 0){
      res.render('sqlumetanje', {error: 'Ne postoji korisnik s tim OIB-om'});
    } else {
      res.render('prikazPodatakaSQL', {data: rows});
    }
    
  } else{
    if(!/(or|["';])/i.test(upisaniOib)){
      const podatci = await pool.query(`SELECT * FROM popis WHERE oib = $1`,[upisaniOib]);
      const rows = podatci.rows;
      if(rows.length == 0){
        res.render('sqlumetanje', {error: 'Ne postoji korisnik s tim OIB-om!'});
      } else{
        res.render('prikazPodatakaSQL', {data: rows});
      }
    }
    else {
      res.render('sqlumetanje', {error: 'POKUŠAJ SQL NAPADA'});
    }
  }
});


app.get("/sqlumetanjeRijec", (req, res)=>{
  res.render('sqlumetanjeRijec');
  });

app.post("/submitRijec", async function(req, res){
  const checkbox = req.body.myCheckbox1;
  const upisaniNadimak = req.body.nadimak.trim();
  
  if (checkbox === 'on'){
    const podatci = await pool.query(`SELECT * FROM nadimci WHERE nadimak = '${upisaniNadimak}'`);
    const rows = podatci.rows
    if (rows.length == 0){
      res.render('sqlumetanjeRijec', {error: 'Ne postoji korisnik s tim korisničkim imenom!'});
    } else {
      res.render('prikazPodatakaRijec', {data: rows});
    }
    
  } else{
    if(!/(or|["';])/i.test(upisaniNadimak)){
      const podatci = await pool.query(`SELECT * FROM nadimci WHERE nadimak = $1`,[upisaniNadimak]);
      const rows = podatci.rows;
      if(rows.length == 0){
        res.render('sqlumetanjeRijec', {error: 'Ne postoji korisnik s tim korisničkim imenom!'});
      } else{
        res.render('prikazPodatakaRijec', {data: rows});
      }
    }
    else {
      res.render('sqlumetanjeRijec', {error: 'POKUŠAJ SQL NAPADA!'});
    }
  }
});

app.post("/submitPrijava", async function(req, res){
  const checkbox = req.body.myCheckbox2;
  const upisanoKorisnickoIme = req.body.korisnickoime;
  const upisanaLozinka = req.body.lozinka;
  //console.log(upisanoKorisnickoIme);
  //console.log(upisanaLozinka)
  //console.log(`SELECT ime, prezime, grad FROM korisnici WHERE korime = '${upisanoKorisnickoIme}' AND lozinka = '${upisanaLozinka}'`);


  
  if (checkbox === 'on'){
    const podatci = await pool.query(`SELECT ime, prezime, grad FROM korisnici WHERE korime = '${upisanoKorisnickoIme}' AND lozinka = '${upisanaLozinka}'`);
    const redak = podatci.rows;
    if (redak.length > 0) {
      res.render("autentificiraniKorisnik", {data: redak});
    }
    else {
      const podatci1 = await pool.query(`SELECT ime, prezime, grad FROM korisnici WHERE korime ='${upisanoKorisnickoIme}'`);
      const row = podatci1.rows;
      if(row.length > 0) {
        res.render("losaautentifikacija", {error: 'Lozinka nije ispravna!'});
      } else {
        const podatci2 = await pool.query(`SELECT ime, prezime, grad FROM korisnici WHERE lozinka ='${upisanaLozinka}'`);
        const row1 = podatci2.rows;
        if(row1.length > 0){
          res.render("losaautentifikacija", {error: 'Korisničko ime nije ispravno!'});
        } else {
          res.render("losaautentifikacija", {error: 'Korisnik ne postoji u bazi!'})
        }
      }
    }
    
  } else{
    const podatci3 = await pool.query(`SELECT ime, prezime, grad FROM korisnici WHERE korime = '${upisanoKorisnickoIme}' AND lozinka = '${upisanaLozinka}'`);
    const redak3 = podatci3.rows;
    if (redak3.length > 0) {
      res.render("autentificiraniKorisnik", {data: redak3});
    } else {
      res.render("losaautentifikacija", {error: 'Podatci za prijavu su pogrešni!'})
    }
    
  }
});

app.get("/losaautentifikacija", (req, res) => {
  res.render('losaautentifikacija');
  });

app.get("/registracija", (req, res) => {
  res.render('registracija');
  });


app.post("/submitRegistracija", async function(req, res){
  const korisnickoIme = req.body.korisnickoime;
  const loz1 = req.body.lozinka;
  const loz2 = req.body.ponovljenalozinka;
  const ime1 = req.body.ime;
  const prezime1 = req.body.prezime;
  const grad1 = req.body.grad;
  const checkbox = req.body.myCheckbox3;

  //console.log(korisnickoIme)
  //console.log(loz1)
  //console.log(loz2)
  //console.log(ime1)
  //console.log(prezime1)
  //console.log(grad1)

  if(loz1 != loz2){
    return res.render("registracija", {error: 'Lozinke nisu jednake, ponovi registraciju!'})
  }    
  //console.log(loz1.length)
  const podatci4 = await pool.query(`SELECT korime FROM korisnici`);
  const redak4 = podatci4.rows;
  //console.log(redak4)

  const postojiKorisnik = redak4.some(korisnik => korisnik.korime === korisnickoIme);

  if (postojiKorisnik) {
    return res.render("registracija", {error: 'Korisničko ime se već koristi, ponovi registraciju!'})
  } else {
    if (checkbox === 'on'){
      const insertQuery = (`INSERT INTO korisnici (korime, lozinka, ime, prezime, grad) VALUES ('${korisnickoIme}', '${loz1}', '${ime1}', '${prezime1}', '${grad1}')`);
      pool.query(insertQuery, (err, result) => {
        if (err) throw err;
        else res.render("losaautentifikacija", {poruka: 'Korisnik uspješno registriran!'})
      })
      
    } else {
      if (loz1.length < 8){
        return res.render("registracija", {error: 'Lozinka mora sadržavati barem 8 znakova!'})
      }
      if (!/\d/.test(loz1)) {
        return res.render("registracija", {error: 'Lozinka mora sadržavati barem jedan broj!'})
      }
      if(!/[!@#$%^&*(),.?":{}|<>]/.test(loz1)){
        return res.render("registracija", {error: 'Lozinka mora sadržavati barem jedan specijalni znak!'})
      }
      const insertQuery1 = (`INSERT INTO korisnici (korime, lozinka, ime, prezime, grad) VALUES ('${korisnickoIme}', '${loz1}', '${ime1}', '${prezime1}', '${grad1}')`);
      pool.query(insertQuery1, (err, result) => {
        if (err) throw err;
        else res.render("losaautentifikacija", {poruka: 'Korisnik uspješno registriran!'})
      })
    }
  }
});

/*app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
  });*/


if (externalUrl) {
  const hostname = '0.0.0.0'; //ne 127.0.0.1
  app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}/ and from outside on ${externalUrl}`);
  });
}
else {
  https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
  }, app)
  .listen(port, function () {
  console.log(`Server running at https://localhost:${port}/`);
  });
}
  