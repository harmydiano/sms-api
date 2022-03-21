import config from 'config';
import AppProcessor from '../_core/app.processor';
import Phone from './phone.model';
import _ from 'lodash';

/**
 * The PhoneProcessor class
 */
class PhoneProcessor extends AppProcessor {
	/**
     * @param {String} id
	 * @return {Sring}
	 */
	static async accountExist(id) {
		const account = await Phone.findOne({where: {number: id}});
		if (!_.isEmpty(account)) {
			return true;
		}
		return false;
	}
}

export default PhoneProcessor;
