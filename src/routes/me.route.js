const express = require('express');
const router = express.Router();
const middlewares = require('../app/middlewares');
const meController = require('../app/controllers/meController');


router.patch(
    '/update/:username', 
    middlewares.verifyTokenAndMeAuth, 
    meController.updateInfo
);
router.delete(
    '/delete/:username', 
    middlewares.verifyTokenAndMeAuth, 
    meController.deleteUser
);
router.get(
    '/:username', 
    middlewares.verifyTokenAndMeAuth, 
    meController.getInfo
);


module.exports = router;