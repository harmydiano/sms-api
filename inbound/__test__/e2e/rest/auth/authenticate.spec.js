// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../app';
import { after, before, describe } from 'mocha';
import { getSmsObject, authObject } from '../../../_seeds/user.seed';
import { INBOUND, TEST_API_KEY } from '../../routes';
import { BAD_REQUEST, UNAUTHORIZED, OK, NOT_FOUND } from '../../../../src/utils/constants';


let should = chai.should();
let server;

// Our parent block
describe('Setup For Inbound sms Test', () => {
	before(async () => {
		server = supertest(await app);
	});
	/*
	 * Function to run after test is complete
	 */
	after(async () => { // Before each test we empty the database
		// await EmptyAuthCollections();
	});

	/*
	 * Test a new main registration /auth/signUp route
	 */
	describe('Inbound Endpoint Test' + INBOUND, () => {
		it('Throw validation error when required payload is missing', async () => {
			const response = await server.post(INBOUND)
				.send({ from: getSmsObject().from, to: getSmsObject().to})
				.set('Accept', 'application/json')
				.auth(authObject().username, authObject().password)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Throw validation error when required length is longer', async () => {
			const response = await server.post(INBOUND)
				.send({ to: '4924195509198004948484757' })
				.auth(authObject().username, authObject().password)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Throw validation error when TO parameter is not found', async () => {
			const response = await server.post(INBOUND)
				.send({ to: '4924195', from: getSmsObject().from, text: getSmsObject().text })
				.auth(authObject().username, authObject().password)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('status_code');
			response.body.meta.should.have.property('error');
			response.body.meta.error.should.be.instanceOf(Object);
		});
		it('Should return response if payload is valid', async () => {
			const response = await server.post(INBOUND)
				.send({ to: getSmsObject().to, from: getSmsObject().from, text: getSmsObject().text })
				.auth(authObject().username, authObject().password)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('meta');
			response.body.meta.should.have.property('success');
			response.body.meta.should.have.property('message');
			response.body.meta.success.should.be.a('boolean');
			response.body.meta.message.should.be.a('string');
		});
	});
});
