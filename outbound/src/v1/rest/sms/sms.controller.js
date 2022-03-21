import AppController from '../_core/app.controller';
import AppError from '../../../lib/api/app-error';
import SmsValidation from './sms.validation';
import SmsProcessor from './sms.processor';
import lang from '../../lang';
import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK } from '../../../utils/constants';
import _ from 'lodash';

/**
 *  SmsController
 */
class SmsController extends AppController {
	// /**
	//  * @param {Object} req The request object
	//  * @param {Object} res The response object
	//  * @param {callback} next The callback to the next program handler
	//  * @return {Object} res The response object
	//  */
	// async inbound(req, res, next) {
	// 	const obj = req.body;
	// 	const validator = await new SmsValidation().create(obj);
	// 	if (!validator.passed) {
	// 		return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
	// 	}
	// 	const canCreateSms = await SmsProcessor.canCreate(obj);
	// 	if (canCreateSms instanceof AppError) {
	// 		return next(canCreateSms);
	// 	}
	// 	const processed = await SmsProcessor.processText(obj);
	// 	const response = await SmsProcessor.getResponse({
	// 		code: OK,
	// 		message: lang.get('sms').created
	// 	});
	// 	return res.status(OK).json(response);
	// }

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async outbound(req, res, next) {
		const obj = req.body;
		const validator = await new SmsValidation().create(obj);
		if (!validator.passed) {
			return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
		}
		const saved = await SmsProcessor.saveApiRequest(obj);
		console.log(saved);
		const canCreateOutbound = await SmsProcessor.canCreateOutbound(obj);
		if (canCreateOutbound instanceof AppError) {
			return next(canCreateOutbound);
		}
		
		const response = await SmsProcessor.getResponse({
			code: OK,
			message: lang.get('sms').created
		});
		return res.status(OK).json(response);
	}
}

export default SmsController;
