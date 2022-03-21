/**
 * People Schema
 */
import Sequelize from 'sequelize';
import db from '../../../setup/database';
import AccountProcessor from './account.processor';

const Account = db().define('account', {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: Sequelize.INTEGER,
	},
	auth_id: {
		type: Sequelize.STRING,
		allowNull: false
	},
	username: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
Account.getProcessor = (model) => {
	return new AccountProcessor(model);
};

/**
 * @typedef Account
 */
export default Account;
