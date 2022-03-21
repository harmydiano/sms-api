import { Router } from 'express';
import auth from '../../middleware/auth';
import response from '../../../middleware/response';
import SmsController from './sms.controller';

const router = Router();

const smsCtrl = new SmsController();

router.route('/inbound/sms')
	.post(auth, smsCtrl.inbound, response);

export default router;
