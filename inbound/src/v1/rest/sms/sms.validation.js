import config from 'config';
import * as Joi from 'joi';
import AppError from '../../../lib/api/app-error';

/**
 * The Sms Validation class
 */
class SmsValidation {
	/**
	 * @param {Object} body The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	async create(body = {}) {
		const schema = Joi.object({
			to: Joi.string()
				.min(6)
				.max(16)
				.required(),
			from: Joi.string()
				.min(6)
				.max(16)
				.required(),
			text: Joi.string()
				.min(1)
				.max(120)
				.required()
            
		}).options({ abortEarly: false });
		const validate = await schema.validate(body, config.get('options'));
		return AppError.formatInputError(validate);
	}
}
export default SmsValidation;
