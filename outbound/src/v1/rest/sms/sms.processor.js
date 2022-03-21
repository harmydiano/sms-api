import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import AppStorage from '../../../lib/api/app-storage';
import lang from '../../lang';
import PhoneProcessor from '../phone/phone.processor';
import { BAD_REQUEST, LIMIT, TIME, NOT_FOUND, OK } from '../../../utils/constants';
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
	static async canCreateOutbound(object) {
		const phone = await PhoneProcessor.accountExist(object.from);
		const existTo = await AppStorage.existInStorage(`stop_${object.to}`);
		const existFrom = await AppStorage.existInStorage(`stop_${object.from}`);
		const requests = await AppStorage.existInStorage(`request_${object.from}`);
		console.log(requests);
		if (requests && requests >= LIMIT) {
			return new AppError(`Limit reached for from ${object.from}`, BAD_REQUEST);
		}
		if (!phone) {
			return new AppError(lang.get('phone').from_not_found, BAD_REQUEST);
		}
		if (existTo || existFrom) {
			return new AppError(`Sms from ${object.from} to ${object.to} blocked by STOP request`, BAD_REQUEST);
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
     * @return {Object} returns the api error if main cannot be verified
     */
	static getCurrentTime() {
		const date = new Date();
		return date.getTime();
	}

	/**
	 * @param {Date} old The date string
     * @return {Object} returns the difference in time
     */
	static timeDifference(old) {
		const date = new Date();
		return Math.abs(old - date.getTime()) / 3600000;
	}

	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async saveApiRequest(object) {
		let count = await this.getApiRequest(object) + 1;
		const time = await this.getCurrentTimeRequest(`request_time_${object.from}`);
		if (!time) {
			await this.saveCurrentTimeRequest(object);
		}
		else {
			const timeDifference = this.timeDifference(time);
			if (timeDifference >= TIME) {
				count = 0;
			}
		}
		
		return await AppStorage.saveToStorage(`request_${object.from}`, count);
	}

	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async saveCurrentTimeRequest(object) {
		const time = this.getCurrentTime();
		return await AppStorage.saveToStorage(`request_time_${object.from}`, time);
	}

	/**
     * @param {Object} object The object properties
     * @return {Object} returns the api error if main cannot be verified
     */
	static async getCurrentTimeRequest(object) {
		const requestTime = await AppStorage.existInStorage(`request_time_${object.from}`);
		// const time = _.isEmpty(requestTime) ? this.getCurrentTime() : requestTime;
		return requestTime;
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
