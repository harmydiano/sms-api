import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import config from 'config';
import lang from '../lang';
import AccountProcessor from '../rest/account/account.processor';
import AppError from '../../lib/api/app-error';
import { UNAUTHORIZED, FORBIDDEN } from '../../utils/constants';

export default async(req, res, next) => {
	const token = req.headers['authorization'];
	// decode token
	if (token) {
		const base64Credentials = req.headers.authorization.split(' ')[1];
		const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
		const [username, password] = credentials.split(':');
		const account = await AccountProcessor.accountExist(username, password);
		// verifies secret and checks exp
		if (!account) {
			const appError = new AppError('Authentication failed', FORBIDDEN, null);
			return next(appError);
		}
		next();
	} else {
		const appError = new AppError(lang.get('auth').AUTH100, UNAUTHORIZED);
		return next(appError);
	}
};
