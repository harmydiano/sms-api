import { Router } from 'express';

import sms from './rest/sms/sms.route';

const router = Router();

router.use(sms);
export default router;
