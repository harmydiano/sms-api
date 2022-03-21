import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import AppStorage from '../../../lib/api/app-storage';
import lang from '../../lang';
import PhoneProcessor from '../phone/phone.processor';
import { BAD_REQUEST, LIMIT, CREATED, NOT_FOUND, OK } from '../../../utils/constants';
import _ from 'lodash';

/**
 * The SmsProcessor class
 */
class SmsProcessor extends AppProcessor {
	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async canCreate(object) {
		const phone = await PhoneProcessor.accountExist(object.to);
		if (!phone) {
			return new AppError(lang.get('phone').not_found, BAD_REQUEST);
		}
		return true;
	}

	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async processText(object) {
		if (object.text.search('STOP') || object.text.search('stop')) {
			if ((!await AppStorage.existInStorage(`stop_${object.to}`))) {
				await AppStorage.saveToStorage(`stop_${object.to}`, object.text);
			}
			if ((!await AppStorage.existInStorage(`stop_${object.from}`))) {
				await AppStorage.saveToStorage(`stop_${object.from}`, object.text);
			}
			return true;
		}
		return false;
	}

	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async saveApiRequest(object) {
		const count = await this.getApiRequest(object) + 1;
		return await AppStorage.saveToStorage(`request_${object.from}`, count);
	}

	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async getApiRequest(object) {
		const request = await AppStorage.existInStorage(`request_${object.from}`);
		const count = _.isEmpty(request) ? 0 : request;
		return count;
	}

	/**
	 * @param {Object} options required for response
	 * @return {Promise<Object>}
	 */
	static async getResponse({ model, value, code, message, count, token, email }) {
		try {
			const meta = AppResponse.getSuccessMeta();
			if (token) {
				meta.token = token;
			}
			_.extend(meta, { status_code: code });
			if (message) {
				meta.message = message;
			}
			return AppResponse.format(meta, value);
		} catch (e) {
			throw e;
		}
	}
}

export default SmsProcessor;
