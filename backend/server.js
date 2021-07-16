import express from "express";
import data from "./data";
import dotenv from "dotenv";
import path from 'path';
import config from "./config";
import bodyParser from "body-parser";
import productRoute from "./routes/productRoute";
import uploadRoute from './routes/uploadRoute';
import userRoute from "./routes/userRoute";
import mongoose from "mongoose";
import orderRoute from "./routes/orderRoute";
dotenv.config();
const mongodbUrl = config.MONGODB_URL;
mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((error) => console.log(error.reason));
const app = express();

/*app.use(bodyParser.json());
app.use("/api/uploads", uploadRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
//app.use('/api/orders', orderRoute);
*/
app.use(bodyParser.json());
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/uploads", uploadRoute);
app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});
app.get("/api/products", (req, res) => {
  res.send(data.products);
});
app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
// static api calling is shut off
/*app.get("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = data.products.find((x) => x._id === productId);
  if (product) res.send(product);
  else res.status(404).send({ msg: "Product Not Found." });
});*/
/*app.get("/api/products", (req, res) => {
  res.send(data.products);
});*/
app.listen(5000, () => {
  console.log("Server started at http://localhost:5000");
});
