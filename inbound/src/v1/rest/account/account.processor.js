import config from 'config';
import AppProcessor from '../_core/app.processor';
import Account from './account.model';
import _ from 'lodash';

/**
 * The AccountProcessor class
 */
class AccountProcessor extends AppProcessor {
	/**
     * @param {String} username
	 * @param {String} password
	 * @return {Sring}
	 */
	static async accountExist(username, password) {
		const account = await Account.findOne({where: {username, auth_id: password}});
		if (!_.isEmpty(account)) {
			return true;
		}
		return false;
	}
}

export default AccountProcessor;
