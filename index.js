require('dotenv').config();
const express = require('express');
const path = require('path');

const cors = require('cors');
const db = require('./utils/database')
const userRouter = require('./routes/user');
const categoryRouter = require('./routes/category');
const productRouter = require('./routes/product');
const billRouter = require('./routes/bill');
const dashboardRouter = require('./routes/dashboard');


const auth = require('./controllers/auth')


const app = express();

app.use(cors({
    origin: 'https://mochamate-frontend.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'data'));
app.set('view engine', 'ejs');


app.use('/user', userRouter);
app.use('/category', auth.authenticateToken, categoryRouter);
app.use('/product', auth.authenticateToken, productRouter);
app.use('/bill', auth.authenticateToken, billRouter);
app.use('/dashboard', auth.authenticateToken, dashboardRouter);

PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is live on PORT ${PORT}`);
})