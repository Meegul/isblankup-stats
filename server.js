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

if (cluster.isMaster) {
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
		res.sendFile('public/index.html', { root: './' });
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

	app.post('/api/:site/inc', (req, res) => {
		const site = req.params.site;
		const auth = req.body.auth;
		if (!authenticated(auth)) {
			res.sendStatus(401);
			res.end();
			return;
		}
		if (site) {
			console.log(`${site} hit at ${new Date().toISOString()}`);
			incrementSite(site);
			res.sendStatus(200);
			res.end();
		}
	})

	console.log(`worker ${process.pid} started!`);
}