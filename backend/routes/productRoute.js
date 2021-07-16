import express from "express";
import Product from "../models/productModel";
import { isAuth, isAdmin } from "../util";
import { getToken } from "../util";
/* for image upload */
//var express = require("express");
var multer = require("multer");
var router = express.Router();
const mime = require("mime-types");
var path = require("path");
var fs = require("fs");

/*const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "../../frontend/public/images/"); 
  },
  filename(req, file, cb) {
    console.log(file);
    let ext = mime.extension(file.mimetype);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });*/
/*const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${+new Date()}.jpg`);
  },
});
const upload = multer({
  storage,
});*/
/* for image upload end */
//const router = express.Router();
// get product list
/*router.get("/", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});*/
// get product list by category or searchkeyword or sortorder
router.get("/", async (req, res) => {
  const category = req.query.category ? { category: req.query.category } : {};
  const searchKeyword = req.query.searchKeyword
    ? {
        name: {
          $regex: req.query.searchKeyword,
          $options: "i",
        },
      }
    : {};
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "lowest"
      ? { price: 1 }
      : { price: -1 }
    : { _id: -1 };
  const products = await Product.find({ ...category, ...searchKeyword }).sort(
    sortOrder
  );
  res.send(products);
});
router.get("/:id", async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not found" });
  }
});
router.post("/", isAuth, isAdmin, async (req, res) => {
  console.log("aree we ready");
  //const path = req.file.path;
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    // image: path,
    brand: req.body.brand,
    price: req.body.price,
    discountRate: req.body.discountRate,
    category: req.body.category,
    countInStock: req.body.countInStock,
    description: req.body.description,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
  });
  const newProduct = await product.save();
  if (newProduct) {
    return res
      .status(201)
      .send({ message: "New Product Created.", data: newProduct });
  }
  return res.status(500).send({ message: "Error In Creating Product." });
});
router.post("/:id/reviews", isAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const review = {
      name: req.body.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      message: "Review saved successfully.",
    });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});
router.put("/:id", isAuth, isAdmin, async (req, res) => {
  // const productId = req.params.id;
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = req.body.name || product.name;
    product.image = req.body.image || product.image;
    product.brand = req.body.brand || product.brand;
    product.price = req.body.price || product.price;
    product.discountRate = req.body.discountRate || product.discountRate;
    product.category = req.body.category || product.category;
    product.countInStock = req.body.countInStock || product.countInStock;

    product.description = req.body.description || product.description;
    const updatedProduct = await product.save();
    if (updatedProduct) {
      return res
        .status(200)
        .send({ message: "Product Updated", data: updatedProduct });
    }
  }

  return res.status(500).send({ message: " Error in Updating Product." });
});
router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  Product.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) {
      res.send(docs);
      console.log("should be deleteed");
      fs.unlink("uploads/" + docs.image, function (err) {
        if (err) {
          console.log("Error while deleting the file " + err);
        }
      });
    } else
      console.log(
        "Error while deleting a record : " + JSON.stringify(err, undefined, 2)
      );
  });
});
/*router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const deletedProduct = await Product.findById(req.params.id);
  if (deletedProduct) {
    await deletedProduct.remove();
    res.send({ message: "Product Deleted" });
  } else {
    res.send("Error in Deletion.");
  }
});*/

export default router;
