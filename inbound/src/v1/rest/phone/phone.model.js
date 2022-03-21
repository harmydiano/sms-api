/**
 * Phone Schema
 */
import Sequelize from 'sequelize';
import db from '../../../setup/database';
import PhoneProcessor from './phone.processor';

const Phone = db().define('phone_number', {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		type: Sequelize.INTEGER,
	},
	account_id: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	number: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
Phone.getProcessor = (model) => {
	return new PhoneProcessor(model);
};

/**
 * @typedef Account
 */
export default Phone;
