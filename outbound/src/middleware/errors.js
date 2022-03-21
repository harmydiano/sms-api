import config from 'config';
import AppError from '../lib/api/app-error';

export default (error, req, res, next) => {
	console.log(error);
	const meta = {};
	if (error instanceof AppError) {
		const err = error.format();
		const code = err.code;
		meta.status_code = code;
		meta.error = { code, message: err.message };
		if (err.messages) {
			meta.error.messages = err.messages;
		}
		if (err.type) {
			meta.error.type = err.type;
		}
	} else if (error instanceof Error) {
		meta.status_code = error.status;
		meta.error = { code: error.status, message: error.message };
		meta.developer_message = error;
	}
	else {
		let code = 500;
		meta.status_code = code;
		meta.error = { code: code, message: 'A problem with our server, please try again later' };
		meta.developer_message = error;
	}
	if (`${config.util.getEnv('NODE_ENV')}` !== 'production') {
		console.log('error >>>>>>>>>>>>>>> ', error);
	}
	console.log('meta ', meta);
	return res.status(meta.status_code || 500).json({ meta });
};
