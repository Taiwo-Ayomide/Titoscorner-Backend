const express = require("express");
const cors = require('cors');
const dotenv = require('dotenv');
const moongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit'); // Rate Limiting
// const { createProxyMiddleware } = require('http-proxy-middleware'); // Reverse Proxy

const userRoute = require("./route/user");
const blogRoute = require("./route/blog");
const ebookRoute = require("./route/ebook");
const podcastRoute = require("./route/podcast");
const cartRoute = require("./route/cart");
const recipeRoute = require("./route/recipe");
const paystackPayment = require("./route/payment");

// const targetServer = 'http://localhost:5000';

const app = express();
dotenv.config();
// Create a rate limiter
const limiter = rateLimit({
    windowMs: 15 * 6 * 1000, // 15 minutes
    max: 25, // limit each ip to 100 request per windowMs
    message: 'Too many request, try again after 15 minutes'
    // message: `${alert('Too many request, try again after 15min')}`
});

// Use limiter
app.use(limiter);

// proxy middleware
// app.use('/api', createProxyMiddleware({
//     target: targetServer,
//     changeOrigin: true,
//     pathRewrite: {
//         "^/api": '',
//     }
// }));


app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend's domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



moongoose
    .connect(process.env.MONGODB_API)
    .then((console.log("DBCOnnected Successfully")));
    // .catch();
 
app.get('/', (req, res) => {
    res.send('Welcome to backend world');
});
app.use("/api/users", userRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/books", ebookRoute);
app.use("/api/podcast", podcastRoute);
app.use("/api/cart", cartRoute);
app.use("/api/recipe", recipeRoute);
app.use("/api/checkout", paystackPayment);


app.listen(5000, () => {
    console.log(`Server is running`);
});