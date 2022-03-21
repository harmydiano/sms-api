import AppResponse from '../../../lib/api/app-response';
import _ from 'lodash';

export const CREATE = 'create';
export const UPDATE = 'update';
export const DELETE = 'delete';

/**
 * The main processor class
 */
export default class AppProcessor {
	/**
	 * @param {Model} model The default model object
	 * for the controller. Will be required to create
	 * an instance of the controller
	 */
	constructor(model) {
		this.model = model;
	}
	
	/**
	 * @param {Object} current required for response
	 * @param {Object} obj required for response
	 * @return {Object}
	 */
	async validateUpdate(current, obj) {
		return null;
	}
	
	/**
	 * @param {Object} obj required for response
	 * @return {Object}
	 */
	async validateCreate(obj) {
		return null;
	}
	
	/**
	 * @param {Object} obj required for response
	 * @return {Object}
	 */
	async postCreateResponse(obj) {
		return false;
	}
	
	/**
	 * @param {Object} obj required for response
	 * @param {Object} response required for response
	 * @return {Object}
	 */
	async postUpdateResponse(obj, response) {
		return false;
	}
	
	/**
	 * @param {Object} options required for response
	 * @return {Promise<Object>}
	 */
	async getApiClientResponse({ model, value, code, message, queryParser, pagination, count, token, email }) {
		const meta = AppResponse.getSuccessMeta();
		if (token) {
			meta.token = token;
		}
		_.extend(meta, { status_code: code });
		if (message) {
			meta.message = message;
		}

		if (model && model.tableName == 'people') {
			const processor = model.getProcessor(model);
			const {sum, feetInch} = processor.sumTotalHeight(value);
			meta.totalHeight = sum;
			meta.totalHeightInch = feetInch;
		}
		if (pagination && !queryParser.getAll) {
			pagination.totalCount = count;
			if (pagination.morePages(count)) {
				pagination.next = pagination.current + 1;
			}
			meta.pagination = pagination.done();
		}
		
		return AppResponse.format(meta, value);
	}
	
	/**
	 * @param {Object} queryParser The query parser
	 * @return {Object}
	 */
	async buildModelQueryObject(queryParser = null) {
		let queryObject = {where: queryParser.query};
		if (queryParser.sort) {
			_.extend(queryObject, queryParser.sort);
		}
		let query = this.model.findAll(queryObject);
		
		return {
			value: await query,
			count: await this.model.count({where: queryParser.query})
		};
	}
	
	/**
	 * @param {Object} obj The payload object
	 * @return {Object}
	 */
	async createNewObject(obj) {
		return this.model.create(obj);
	}
	
	/**
	 *  @param {Object} model The payload object
	 * @param {Object} current The payload object
	 * @param {Object} obj The payload object
	 * @return {Object}
	 */
	async updateObject(model, current, obj) {
		_.extend(current, obj);
		const query = model.build(current);
		return query.save();
	}
	
	/**
	 * @param {Object} req The request object
	 * @return {Promise<Object>}
	 */
	async prepareBodyObject(req) {
		let obj = Object.assign({}, req.body, req.params);
		return obj;
	}
	
	/**
	 * @param {Object} model The model object
	 * @param {Object} obj The request object
	 * @return {Promise<Object>}
	 */
	async retrieveExistingResource(model, obj) {
		if (model.uniques && !_.isEmpty(model.uniques)) {
			const uniqueKeys = model.uniques;
			const query = {};
			for (const key of uniqueKeys) {
				query[key] = obj[key];
			}
			const found = await model.findOne({where: { ...query, deleted: false, active: true }});
			if (found) {
				return found;
			}
		}
		return null;
	}
}
