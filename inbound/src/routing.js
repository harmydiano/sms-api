import config from 'config';
import apiAuth from './middleware/api';
import errorHandler from './middleware/errors';

import Q from 'q';
import { NOT_FOUND } from './utils/constants';
import AppError from './lib/api/app-error';
import apiV1 from './v1';

const prefix = config.get('api.prefix');

/**
 * The routes will add all the application defined routes
 * @param {app} app The main is an instance of an express application
 * @return {Promise<void>}
 */
export default async (app) => {
	// check if api key is present
	app.use(prefix, apiAuth);
	// load version 1 routes
	app.use('/api/v1', apiV1);
	// check url for state codes and api version
	app.use((req, res, next) => {
		const err = new Error('Not Found');
		err.status = 405;
		next(err);
	});

	// check if url contains empty request
	app.use('*', (req, res, next) => {
		return next(new AppError('not found', NOT_FOUND));
	});
	// load the error middleware
	app.use(errorHandler);
	return Q.resolve(app);
};
