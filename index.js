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
    origin: 'http://localhost:4200',  // Replace with your frontend URL for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Define the allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Specify the allowed headers
}));
app.options('*', cors());  // Handle preflight requests for all routes
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set('views', path.join(__dirname, 'data'));
app.set('view engine', 'ejs');


app.use('/user', userRouter);
app.use('/category', auth.authenticateToken, categoryRouter);
app.use('/product', auth.authenticateToken, productRouter);
app.use('/bill', auth.authenticateToken, billRouter);
app.use('/dashboard', auth.authenticateToken, dashboardRouter);


// app.use('/', (req, res, next)=>{
//     res.render('report', bill = {
//         "uuid": "b7c01e84-82d0-4fbd-b221-d4c0d0e9571f",
//         "name": "John Doe",
//         "email": "johndoe@example.com",
//         "contactnumber": "123-456-7890",
//         "paymentMethod": "Credit Card",
//         "total": 10500,  // Assuming total is in cents ($105.00)
//         "productDetails": [
//           {
//             "name": "Product 1",
//             "quantity": 2,
//             "price": 1500  // $15.00 per item
//           },
//           {
//             "name": "Product 2",
//             "quantity": 1,
//             "price": 3500  // $35.00 per item
//           },
//           {
//             "name": "Product 3",
//             "quantity": 3,
//             "price": 1000  // $10.00 per item
//           }
//         ],
//         "createdBy": "Admin",
//         "createdAt": "2025-02-17T10:00:00Z"
//       }
//       )
// })

PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`Server is live on PORT ${PORT}`);
})