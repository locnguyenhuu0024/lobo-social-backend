const express = require('express');
const router = express.Router();
const middlewares = require('../app/middlewares');
const meController = require('../app/controllers/meController');


router.patch(
    '/update/', 
    middlewares.verifyTokenAndMeAuth, 
    meController.updateInfo
);
router.delete(
    '/delete/', 
    middlewares.verifyTokenAndMeAuth, 
    meController.deleteUser
);
router.get(
    '/', 
    middlewares.verifyTokenAndMeAuth, 
    meController.getInfo
);


module.exports = router;