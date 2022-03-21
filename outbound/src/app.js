import '@babel/polyfill';
import config from 'config';
import http from 'http';
import loadRoutes from './routing';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import Q from 'q';
import log from './setup/logging';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
	// exposedHeaders: ['ETag']
}));
app.set('trust proxy', true);
app.set('port', config.get('app.port'));

export default loadRoutes(app)
	.then(async () => {
		// await runJob();
		log.debug(`Database loaded `);
		// return loadRoutes(app);
	})
	.then(async () => {
		const server = await http.createServer(app)
			.listen(config.get('app.port'));
		console.log(`\n
	\tApplication listening on ${config.get('app.baseUrl')}\n
	\tEnvironment => ${config.util.getEnv('NODE_ENV')} ${server}\n
	\tDate: ${new Date()}`);
		return Q.resolve(app);
	}, err => {
		console.log('There was an un catch error : ');
		console.error(err);
	});
