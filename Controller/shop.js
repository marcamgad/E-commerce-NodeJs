const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');
const product = require('../models/product');
const stripe = require('stripe')('');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  // dah Mongodb Product.fetchAll()
  const page = +req.query.page;
  let totalItems;
  Product.find() // Mongoose
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
      .skip((page - 1)*ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE),
        currentPage: page,
        previousPage: page - 1
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
    /*Product.findAll({where: {id:prodId}})
    .then(product =>{
      res.render('shop/product-detail', {
        product: product[0],
        pageTitle: product[0].title,
        path: '/products'
      });
    })
      .catch(err => console.log(err));      Same Thing but findByPk(findById) is Better */ 
  Product.findById(prodId) // bardo mawgouda f mongoose 
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  // MongoDb Product.fetchAll()
  const page = + req.query.page || 1;
  let totalItems;
  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
      .skip((page - 1)* ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
  })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE),
        currentPage: page,
        previousPage: page -1
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getCart = (req, res, next) => {
  /* Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(
          prod => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  }); */
/*   req.session.user
  .getCart()
  .then(cart =>{
    return cart.getProducts().then(products =>{
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    }).catch(err=> console.log(err));
  })
  .catch(err=> console.log(err));  MySql*/
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products 
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  /* let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product.cartItem.update({ quantity: newQuantity }); // Update the quantity directly
      }

      return Product.findByPk(prodId)
        .then(product => {
          return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err)); */
    Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};




exports.postCartDeleteProduct = (req, res, next) => {
  /* const prodId = req.body.productId;
  let fetchedCart;
  req.session.user
  .getCart()
  .then(cart=>{
    fetchedCart = cart;
    return cart.getProducts({where: {id:prodId} });
  })
  .then(products =>{
    const product = products[0];
    //product.cartItem.destroy(); hya hya fetchedCart.removeProduct(product)
    if (product) {
      return fetchedCart.removeProducts(product);
    }
  })
  .then(result =>{
    res.redirect('/cart');
  })
  .catch(err=> console.log(err)); */
  const prodId = req.body.productId;
  req.user
  .deleteItemFromCart(prodId)
  .then(result=>{
    res.redirect('/cart');
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};


exports.getCheckout = (req, res, next) => {
  let products;
  let totalSum = 0;
  req.user
    .populate('cart.items.productId') // This fetches the full product details
    .then(user => {
      products = user.cart.items;
      totalSum = 0;
      products.forEach(p =>{
        totalSum += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: products.map(p => {
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: p.productId.title,
                description: p.productId.description
              },
              unit_amount: p.productId.price * 100 // Stripe expects amount in cents
            },
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });

    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: totalSum,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500; 
      return next(error);
    })
};

// exports.postOrder = (req, res, next) => {
//   /* let fetchedCart;
//   req.user
//     .getCart()
//     .then(cart => {
//       fetchedCart = cart;
//       return cart.getProducts();
//     })
//     .then(products => {
//       return req.session.user
//         .createOrder()
//         .then(order => {
//           return order.addProducts(
//             products.map(product => {
//               product.orderItem = { quantity: product.cartItem.quantity };
//               return product;
//             })
//           );
//         })
//         .catch(err => console.log(err));
//     })
//     .then(result => {
//       return fetchedCart.setProducts(null);
//     })
//     .then(result => {
//       res.redirect('/orders');
//     })
//     .catch(err => console.log(err)); */
//     req.user
//     .populate('cart.items.productId')
//     .then(user => {
//       const products = user.cart.items.map(i => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         products: products
//       });
//       return order.save();
//     })
//     .then(result => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect('/orders');
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getCheckoutSuccess =(req,res,next) => {
  req.user
  .populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items.map(i => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    });
    return order.save();
  })
  .then(result => {
    return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders');
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getOrders = (req, res, next) => {
  // req.session.user dah MongoDb ma3 el getOrders()
    /* .getOrders({include: ['products']})  this is Sequilize*/
    // getOrders()
    Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if(!order){
      return next(new Error("No Order found!"));
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error("Unauthorized"));
    }
    const invoiceName = 'invoice-'+ orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createReadStream(invoicePath));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName + '"');
    pdfDoc.pipe(res);
    pdfDoc.fontSize(16).text('Invoice');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price
      pdfDoc.fontSize(16).text(prod.product.title + ' - '+ prod.quantity + ' x '+ '$' + prod.product.price);
    });
    pdfDoc.text('Total Price: $' + totalPrice);
    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if(err){
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName + '"');
    //   res.send(data);
    // }); 
  })
  .catch(err => next(err));
};