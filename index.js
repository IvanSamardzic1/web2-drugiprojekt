"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var https_1 = __importDefault(require("https"));
var path_1 = __importDefault(require("path"));
var pg_1 = require("pg");
var express_openid_connect_1 = require("express-openid-connect");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var externalUrl = process.env.RENDER_EXTERNAL_URL;
var app = (0, express_1.default)();
var port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 8000;
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use(express_1.default.urlencoded({ extended: true }));
var config = {
    authRequired: false,
    idpLogout: true,
    secret: process.env.SECRET,
    baseURL: externalUrl || "https://localhost:".concat(port),
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-h2nq1p48ta3mwij5.us.auth0.com',
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code',
        //scope: "openid profile email"   
    },
};
app.use((0, express_openid_connect_1.auth)(config));
var pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'projekt_baza',
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: true
});
app.get("/", function (req, res) {
    res.render('index');
});
app.get("/sqlumetanje", function (req, res) {
    res.render('sqlumetanje');
});
app.post("/submit", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var checkbox, upisaniOib, podatci, rows, podatci, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkbox = req.body.myCheckbox;
                    upisaniOib = req.body.oib;
                    if (!(checkbox === 'on')) return [3 /*break*/, 2];
                    return [4 /*yield*/, pool.query("SELECT * FROM popis WHERE oib = '".concat(upisaniOib, "'"))];
                case 1:
                    podatci = _a.sent();
                    rows = podatci.rows;
                    if (rows.length == 0) {
                        res.render('sqlumetanje', { error: 'Ne postoji korisnik s tim OIB-om' });
                    }
                    else {
                        res.render('prikazPodatakaSQL', { data: rows });
                    }
                    return [3 /*break*/, 5];
                case 2:
                    if (!!/(or|["';])/i.test(upisaniOib)) return [3 /*break*/, 4];
                    return [4 /*yield*/, pool.query("SELECT * FROM popis WHERE oib = $1", [upisaniOib])];
                case 3:
                    podatci = _a.sent();
                    rows = podatci.rows;
                    if (rows.length == 0) {
                        res.render('sqlumetanje', { error: 'Ne postoji korisnik s tim OIB-om!' });
                    }
                    else {
                        res.render('prikazPodatakaSQL', { data: rows });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    res.render('sqlumetanje', { error: 'POKUŠAJ SQL NAPADA' });
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
});
app.get("/sqlumetanjeRijec", function (req, res) {
    res.render('sqlumetanjeRijec');
});
app.post("/submitRijec", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var checkbox, upisaniNadimak, podatci, rows, podatci, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkbox = req.body.myCheckbox1;
                    upisaniNadimak = req.body.nadimak.trim();
                    if (!(checkbox === 'on')) return [3 /*break*/, 2];
                    return [4 /*yield*/, pool.query("SELECT * FROM nadimci WHERE nadimak = '".concat(upisaniNadimak, "'"))];
                case 1:
                    podatci = _a.sent();
                    rows = podatci.rows;
                    if (rows.length == 0) {
                        res.render('sqlumetanjeRijec', { error: 'Ne postoji korisnik s tim korisničkim imenom!' });
                    }
                    else {
                        res.render('prikazPodatakaRijec', { data: rows });
                    }
                    return [3 /*break*/, 5];
                case 2:
                    if (!!/(or|["';])/i.test(upisaniNadimak)) return [3 /*break*/, 4];
                    return [4 /*yield*/, pool.query("SELECT * FROM nadimci WHERE nadimak = $1", [upisaniNadimak])];
                case 3:
                    podatci = _a.sent();
                    rows = podatci.rows;
                    if (rows.length == 0) {
                        res.render('sqlumetanjeRijec', { error: 'Ne postoji korisnik s tim korisničkim imenom!' });
                    }
                    else {
                        res.render('prikazPodatakaRijec', { data: rows });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    res.render('sqlumetanjeRijec', { error: 'POKUŠAJ SQL NAPADA!' });
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
});
app.post("/submitPrijava", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var checkbox, upisanoKorisnickoIme, upisanaLozinka, podatci, redak, podatci1, row, podatci2, row1, podatci3, redak3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkbox = req.body.myCheckbox2;
                    upisanoKorisnickoIme = req.body.korisnickoime;
                    upisanaLozinka = req.body.lozinka;
                    if (!(checkbox === 'on')) return [3 /*break*/, 7];
                    return [4 /*yield*/, pool.query("SELECT ime, prezime, grad FROM korisnici WHERE korime = '".concat(upisanoKorisnickoIme, "' AND lozinka = '").concat(upisanaLozinka, "'"))];
                case 1:
                    podatci = _a.sent();
                    redak = podatci.rows;
                    if (!(redak.length > 0)) return [3 /*break*/, 2];
                    res.render("autentificiraniKorisnik", { data: redak });
                    return [3 /*break*/, 6];
                case 2: return [4 /*yield*/, pool.query("SELECT ime, prezime, grad FROM korisnici WHERE korime ='".concat(upisanoKorisnickoIme, "'"))];
                case 3:
                    podatci1 = _a.sent();
                    row = podatci1.rows;
                    if (!(row.length > 0)) return [3 /*break*/, 4];
                    res.render("losaautentifikacija", { error: 'Lozinka nije ispravna!' });
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, pool.query("SELECT ime, prezime, grad FROM korisnici WHERE lozinka ='".concat(upisanaLozinka, "'"))];
                case 5:
                    podatci2 = _a.sent();
                    row1 = podatci2.rows;
                    if (row1.length > 0) {
                        res.render("losaautentifikacija", { error: 'Korisničko ime nije ispravno!' });
                    }
                    else {
                        res.render("losaautentifikacija", { error: 'Korisnik ne postoji u bazi!' });
                    }
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, pool.query("SELECT ime, prezime, grad FROM korisnici WHERE korime = '".concat(upisanoKorisnickoIme, "' AND lozinka = '").concat(upisanaLozinka, "'"))];
                case 8:
                    podatci3 = _a.sent();
                    redak3 = podatci3.rows;
                    if (redak3.length > 0) {
                        res.render("autentificiraniKorisnik", { data: redak3 });
                    }
                    else {
                        res.render("losaautentifikacija", { error: 'Podatci za prijavu su pogrešni!' });
                    }
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
});
app.get("/losaautentifikacija", function (req, res) {
    res.render('losaautentifikacija');
});
app.get("/registracija", function (req, res) {
    res.render('registracija');
});
app.post("/submitRegistracija", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var korisnickoIme, loz1, loz2, ime1, prezime1, grad1, checkbox, podatci4, redak4, postojiKorisnik, insertQuery, insertQuery1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    korisnickoIme = req.body.korisnickoime;
                    loz1 = req.body.lozinka;
                    loz2 = req.body.ponovljenalozinka;
                    ime1 = req.body.ime;
                    prezime1 = req.body.prezime;
                    grad1 = req.body.grad;
                    checkbox = req.body.myCheckbox3;
                    //console.log(korisnickoIme)
                    //console.log(loz1)
                    //console.log(loz2)
                    //console.log(ime1)
                    //console.log(prezime1)
                    //console.log(grad1)
                    if (loz1 != loz2) {
                        return [2 /*return*/, res.render("registracija", { error: 'Lozinke nisu jednake, ponovi registraciju!' })];
                    }
                    return [4 /*yield*/, pool.query("SELECT korime FROM korisnici")];
                case 1:
                    podatci4 = _a.sent();
                    redak4 = podatci4.rows;
                    postojiKorisnik = redak4.some(function (korisnik) { return korisnik.korime === korisnickoIme; });
                    if (postojiKorisnik) {
                        return [2 /*return*/, res.render("registracija", { error: 'Korisničko ime se već koristi, ponovi registraciju!' })];
                    }
                    else {
                        if (checkbox === 'on') {
                            insertQuery = ("INSERT INTO korisnici (korime, lozinka, ime, prezime, grad) VALUES ('".concat(korisnickoIme, "', '").concat(loz1, "', '").concat(ime1, "', '").concat(prezime1, "', '").concat(grad1, "')"));
                            pool.query(insertQuery, function (err, result) {
                                if (err)
                                    throw err;
                                else
                                    res.render("losaautentifikacija", { poruka: 'Korisnik uspješno registriran!' });
                            });
                        }
                        else {
                            if (loz1.length < 8) {
                                return [2 /*return*/, res.render("registracija", { error: 'Lozinka mora sadržavati barem 8 znakova!' })];
                            }
                            if (!/\d/.test(loz1)) {
                                return [2 /*return*/, res.render("registracija", { error: 'Lozinka mora sadržavati barem jedan broj!' })];
                            }
                            if (!/[!@#$%^&*(),.?":{}|<>]/.test(loz1)) {
                                return [2 /*return*/, res.render("registracija", { error: 'Lozinka mora sadržavati barem jedan specijalni znak!' })];
                            }
                            insertQuery1 = ("INSERT INTO korisnici (korime, lozinka, ime, prezime, grad) VALUES ('".concat(korisnickoIme, "', '").concat(loz1, "', '").concat(ime1, "', '").concat(prezime1, "', '").concat(grad1, "')"));
                            pool.query(insertQuery1, function (err, result) {
                                if (err)
                                    throw err;
                                else
                                    res.render("losaautentifikacija", { poruka: 'Korisnik uspješno registriran!' });
                            });
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
});
/*app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
  });*/
if (externalUrl) {
    var hostname_1 = '0.0.0.0'; //ne 127.0.0.1
    app.listen(port, hostname_1, function () {
        console.log("Server locally running at http://".concat(hostname_1, ":").concat(port, "/ and from outside on ").concat(externalUrl));
    });
}
else {
    https_1.default.createServer({
        key: fs_1.default.readFileSync('server.key'),
        cert: fs_1.default.readFileSync('server.cert')
    }, app)
        .listen(port, function () {
        console.log("Server running at https://localhost:".concat(port, "/"));
    });
}
