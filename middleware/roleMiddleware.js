const jwt = require("jsonwebtoken");
const { secret } = require("../config");

module.exports = function (allowedRoles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            return next();
        }

        try {
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(403).json({ message: "Пользователь не авторизован" });
            }
            const { roles: userRoles } = jwt.verify(token, secret);

            // Проверяем, есть ли у пользователя хотя бы одна из разрешенных ролей
            const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));

            if (!hasAllowedRole) {
                return res.status(403).json({ message: "У вас нет доступа" });
            }

            next();
        } catch (e) {
            console.error(e);
            return res.status(403).json({ message: "Пользователь не авторизован" });
        }
    };
};
