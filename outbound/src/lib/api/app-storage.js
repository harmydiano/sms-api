import bluebird from 'bluebird';
import redis from 'redis';
import dotenv from 'dotenv';


/**
 * The App Storage class
 */
class AppStorage {
	/**
	 * @constructor
	 */
	constructor() {
		bluebird.promisifyAll(redis);
		dotenv.config();
		this.redisPort = process.env.REDIS_PORT;
		this.redisHost = process.env.REDIS_HOST;
		this.redisClient = redis.createClient({port: this.redisPort, host: this.redisHost});
	}
	/**
     * 
     * @param {String} key 
     * @return {Boolean}
     */
	async existInStorage (key) {
		// check if key already exist in storage
		const result = await this.redisClient.getAsync(key);
		if (result) {
			return result;
		}
		return null;
	}
    
	/**
     * 
     * @param {String} key 
     * @param {Array} data
     * @return {Boolean}
     */
	async saveToStorage (key, data) {
		// save data to storage
		const result = await this.redisClient.setex(key, 14400, data);
		if (result) {
			return true;
		}
		return null;
	}
    
	/**
     * 
     * @param {String} key 
     * @param {Array} data
     * @return {Boolean}
     */
	async compareToStorage (key, data) {
		// compare if data match storage
		const result = await this.redisClient.getAsync(key);
		if (result == data) {
			return true;
		}
		return null;
	}
    
	/**
     * 
     * @param {String} key 
     * @return {Boolean}
     */
	async removeInStorage (key) {
		// check if key already exist in storage
		const result = await this.redisClient.del(key);
		if (result) {
			return true;
		}
		return null;
	}
}
export default new AppStorage();
