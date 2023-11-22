require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const keys = require('./keys');
const postRouter = require('./routes/post');
const authRouter = require('./routes/authRouter.js');
const Role = require('./models/Role');
const User = require('./models/User');

const port = process.env.PORT || 5000;
const clientPath = path.join(__dirname, 'client');

const app = express();

mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(keys.mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(clientPath));
app.use('/api/post', postRouter);
app.use('/api/auth', authRouter);

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getRoleValue/:roleId', async (req, res) => {
    const roleId = req.params.roleId;

    try {
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Роль не найдена' });
        }
        res.json({ value: role.value });
    } catch (error) {
        console.error('Ошибка при получении значения роли:', error);
        res.status(500).json({ message: 'Ошибка при получении значения роли' });
    }
});

app.post('/assignRole/:userId/:roleId', async (req, res) => {
    const userId = req.params.userId;
    const roleId = req.params.roleId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        user.roles = [roleId];
        await user.save();

        res.status(200).json({ message: 'Роль пользователя успешно обновлена' });
    } catch (error) {
        console.error('Ошибка при изменении роли пользователя:', error);
        res.status(500).json({ message: 'Ошибка при изменении роли пользователя' });
    }
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log("listening for requests on port localhost:5000");
    })
})