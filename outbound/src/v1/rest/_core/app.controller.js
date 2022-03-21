import QueryParser from '../../../lib/api/query-parser';
import AppError from '../../../lib/api/app-error';
import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK } from '../../../utils/constants';
import lang from '../../lang/index';
import _ from 'lodash';
import Pagination from '../../../lib/api/pagination';

/**
 * The App controller class
 */
class AppController {
	/**
	 * @param {Model} model The default model object
	 * for the controller. Will be required to create
	 * an instance of the controller
	 */
	constructor(model) {
		if (new.target === AppController) {
			throw new TypeError('Cannot construct Abstract instances directly');
		}
		if (model) {
			this.model = model;
			this.lang = lang.get(model.tableName);
		}
		this.create = this.create.bind(this);
		this.findOne = this.findOne.bind(this);
		this.find = this.find.bind(this);
		this.update = this.update.bind(this);
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} The response object
	 */
	async findOne(req, res, next) {
		let object = req.object;
		req.response = {
			model: this.model,
			code: OK,
			value: object
		};
		return next();
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async create(req, res, next) {
		try {
			const processor = this.model.getProcessor(this.model);
			const validate = await this.model.getValidator().create(req.body);
			if (!validate.passed) {
				return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors));
			}
			const obj = await processor.prepareBodyObject(req);
			let object = await processor.retrieveExistingResource(this.model, obj);
			if (object) {
				const returnIfFound = this.model.returnDuplicate;
				if (returnIfFound) {
					req.response = {
						message: this.lang.created,
						model: this.model,
						code: CREATED,
						value: object
					};
					return next();
				} else {
					const messageObj = this.model.uniques.map(m => ({ [m]: `${m} must be unique` }));
					const appError = new AppError(lang.get('error').resource_already_exist, CONFLICT, messageObj);
					return next(appError);
				}
			} else {
				let checkError = await processor.validateCreate(obj);
				if (checkError) {
					return next(checkError);
				}
				object = await processor.createNewObject(obj);
			}
			req.response = {
				message: this.lang.created,
				model: this.model,
				code: CREATED,
				value: await object
			};
			await processor.postCreateResponse(object);
			return next();
		} catch (err) {
			return next(err);
		}
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} The response object
	 */
	async find(req, res, next) {
		const queryParser = new QueryParser(Object.assign({}, req.query));
		console.log(queryParser);
		const pagination = new Pagination(req.originalUrl);
		const processor = this.model.getProcessor(this.model);
		try {
			const { value, count } = await processor.buildModelQueryObject(pagination, queryParser);
			req.response = {
				model: this.model,
				code: OK,
				value,
				count,
				queryParser,
				pagination
			};
			return next();
		} catch (err) {
			return next(err);
		}
	}
	
	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {Function} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async update(req, res, next) {
		try {
			const processor = this.model.getProcessor(this.model);
			let object = req.object;
			const obj = await processor.prepareBodyObject(req);
			const validate = await this.model.getValidator().update(obj);
			if (!validate.passed) {
				const error = new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors);
				return next(error);
			}
			if (this.model.uniques && this.model.uniques.length > 0 && !_.isEmpty(_.pick(obj, this.model.uniques))) {
				let found = await processor.retrieveExistingResource(this.model, obj);
				if (found) {
					const messageObj = this.model.uniques.map(m => ({ [m]: `${m} must be unique` }));
					const appError = new AppError(lang.get('error').resource_already_exist, CONFLICT, messageObj);
					return next(appError);
				}
			}
			let canUpdateError = await processor.validateUpdate(object, obj);
			if (!_.isEmpty(canUpdateError)) {
				return next(canUpdateError);
			}
			object = await processor.updateObject(this.model, object, obj);
			req.response = {
				model: this.model,
				code: OK,
				message: this.lang.updated,
				value: object
			};
			const postUpdate = await processor.postUpdateResponse(object, req.response);
			if (postUpdate) {
				req.response = Object.assign({}, req.response, postUpdate);
			}
			return next();
		} catch (err) {
			return next(err);
		}
	}
}

export default AppController;
