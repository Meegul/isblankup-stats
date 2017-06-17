const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const cluster = require('cluster');
const numCPUS = require('os').cpus().length;

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

	console.log(`worker ${process.pid} started!`);
}