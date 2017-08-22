const express = require('express');
const app = express();
const url = require('url')
const port = process.env.PORT || 3001;
const cluster = require('cluster');
const pg = require('pg');
const bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
require('dotenv').config();
const numCPUS = require('os').cpus().length;
const authToken = process.env.AUTH_TOKEN;

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};
const pool = new pg.Pool(config);
pool.on('error', function (err, client) {
	console.log('idle client error', err.message, err.stack);
});
function query(text, values, callback) {
	return pool.query(text, values, callback);
};

function authenticated(key) {
	const authed = key == authToken;
	if (!authed)
		console.log(`failed to authenticate post. Provided key: ${key}`);
	return authed;
}

function incrementSite(site) {
	query(`UPDATE stats SET hits = hits + 1 WHERE site = ($1)`, [`${site}`])
		.catch((error) => {
			console.log(error);
		});
}

function createNewSite(site) {
	query(`INSERT INTO stats (site, hits) VALUES (($1), 1)`, [`${site}`])
		.catch((error) => {
			console.log(error);
		});
}

function addNewHit(site, code) {
	query(`INSERT INTO hits (site, code, time) VALUES (($1), ($2), to_timestamp(($3)))`, [`${site}`, code, new Date().getTime()/1000])
		.catch((error) => {
			console.log(error);
		});
}

if (cluster.isMaster && process.env.ENVIRONMENT === 'production') {
	//For the process starting the cluster
	console.log(`Master ${process.pid} is running`);

	new Array(numCPUS).fill(0).forEach((on) => {
		cluster.fork();
	});

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	//For worker processes
	
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});

	app.use(express.static('public'));

	app.get('/', (req, res) => {
		res.sendFile('public/stats.html', { root: './' });
	});

	app.get('/site/:site', (req, res) => {
		if (!req.params.site) {
			res.send('no thx');
		}

		query('SELECT hits FROM stats WHERE site = ($1)', [`${req.params.site}`])
			.then((result) => {
				if (result.rowCount > 0) {
					res.send(`${req.params.site} : ${result.rows[0].hits}`);
				} else res.send(`${req.params.site} : 0`);
			})
			.catch((error) => {
				res.send(error);
			});
	})

	app.get('/site/:site/history', (req, res) => {
		if (!req.params.site) {
			res.sendStatus(404);
		}

		query('SELECT "code", "time" FROM hits WHERE site = ($1)', [`${req.params.site}`])
			.then((result) => {
				const responseObj = result.rows.map((row) => {
					return {
						code: row.code,
						up: row.code === 200,
						time: row.time
					};
				});
				res.send(JSON.stringify(responseObj));
			})
			.catch((error) => {
				console.log(error);
				res.sendStatus(500);
			})
	});

	app.post('/api/:site/inc', (req, res) => {
		const site = req.params.site;
		const auth = req.body.auth;
		const code = req.body.code;
		if (!authenticated(auth)) {
			res.sendStatus(401);
			res.end();
			return;
		}
		console.log(`${site} hit at ${new Date().toISOString()}`);
		//Update if site exists in table, create new otherwise
		query('SELECT hits FROM stats WHERE site = ($1)', [`${req.params.site}`])
			.then((result) => {
				if (result.rowCount > 0) {
					incrementSite(site);
				} else {
					createNewSite(site);
				}
				addNewHit(site, code)
				res.sendStatus(200);
			})
			.catch((error) => {
				res.send(error);
			});
	})

	console.log(`worker ${process.pid} started!`);
}