const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require('express-validator')
const authMiddleware = require('../middleware/authMiddleware.js')
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/registration', [
    check('username','Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть больше 4 и меньше 20 символов.').isLength({min:4, max:20})],
    controller.registration)
router.post('/login', controller.login)

router.get('/current_user_info', authMiddleware, controller.getCurrentUserInfo);

router.get('/users', roleMiddleware(['ADMIN']), controller.getUsers);


module.exports = router