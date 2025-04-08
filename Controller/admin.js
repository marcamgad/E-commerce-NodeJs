const { where, ValidationError } = require("sequelize");
const Product = require("../models/product");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const { validationResult } = require("express-validator");
const fileHelper = require('../util/file');
const product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  //const imageUrl = req.body.image;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price, 
        description: description
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: []
    })
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true, 
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;
  // const product = new Product(title,price,description,imageUrl, null, req.user._id); dah f MongoDb
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save() // dah 3amlna wa7da save f Mongodb 3alashan msh defined bss f Mongoose hya defined
    /* Bnasta5demo fl MySQL
   .then()
  .catch()
  req.user.createProduct({
    title:title,
    price:price,
    imageUrl:imageUrl,
    description:description
  }) */
    .then(() => {
      console.log("created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  /* req.user.getProducts({where: { id: prodId}}) this is for MySQL*/
  //Product.findByPk(prodId)
  Product.findById(prodId) // mawgouda f mongoose msh zay mongoDb
    .then((products) => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null ,
        validationErrors: []
      });
    })
    .catch((err) => {
      //console.log(err);
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true, 
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   errorMessage:'Database operation has failed please try again.',
      //   ValidationErrors: []
      //});
      //res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  // const updatedImageUrl = req.body.imageUrl;
  const image = req.file;
  const updatedDesc = req.body.description;


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true, 
      product: {
        title: updatedTitle,
        //imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  /*   Product.findByPk(prodId)
  .then(product=>{
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.updatedDesc = updatedDesc;
    return product.save();
    }) this is use for MySQL */
  // MongoDb const product = new Product(updatedTitle,updatedPrice,updatedDesc,updatedImageUrl,prodId);
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if(image){
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      //product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save()
      .then((result) => {
        console.log("Updated Product");
        res.redirect("/admin/products");
      })
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  /* req.user
  .getProducts() this is for MySQL*/
  // f mongodb Product.fetchAll()
  Product.find()
    //.populate('UserId') Very IMPORTANT
    //.select() Very IMPORTANT
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//exports.postDeleteProduct = (req, res, next) => {
exports.deleteProduct = (req, res, next) => {
  //const productId = req.body.productId;
  const productId = req.params.productId;
  Product.findById(productId).then(product => {
    if(!product){
      return next(new Error("Product Not Found!"));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: productId, userId: req.user._id })
  })
  /*  Product.findByPk(productId)
  .then(product =>{
    return product.destroy();
  }) this use for MySQl*/
  // this is by MongoDb Product.deleteById(productId)
  // Product.findByIdAndDelete(productId)
  
    .then(() => {
      console.log("Destroyed Product"); 
      // res.redirect("/admin/products");
      res.status(200).json({
        message: 'Success!'
      })
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
      res.status(500).json({message: 'Deleting product failed!'});
    });
};
