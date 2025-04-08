const path = require("path");
/* const sequelize = require('./util/dataBase'); */
const express = require("express");
const bodyParser = require("body-parser");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const errorController = require("./Controller/error");
/* const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item'); */
// dah Mongodb const mongoConnect = require('./util/dataBase').mongoConnect;

const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const MongoDb_URI =
  "";

const store = new mongoDBStore({
  uri: MongoDb_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session?.isLoggedIn || false;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// secret: 'my secret': This is a string used to sign and hash the session ID cookie, ensuring the integrity of the session data. It's critical that this value is kept secret to prevent tampering.
// resave: false: This option controls whether the session is saved back to the store, even if it wasn’t modified during the request.
// saveUninitialized: false: This option controls whether uninitialized sessions (sessions that are new but haven’t been modified) are saved to the session store.

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isLoggedIn: req.session?.isLoggedIn || false,
    csrfToken: req.csrfToken(),
  });
});

/* SQL using Association 
 Product.belongsTo(User,{constraints:true , onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through : CartItem});
Product.belongsToMany(Cart,{through : CartItem});
Order.belongsToMany(Product,{through: OrderItem});

Order.belongsTo(User);
User.hasMany(Order);

sequelize
//.sync({force: true})
.sync()
.then(result=>{
  return User.findByPk(1);
  //console.log(result);
  
})
.then(user =>{
  if(!user)
    return User.create({name: 'marc' , email:'test@kkft.com' });
  return Promise.resolve(user);
})
.then(user =>{
  return user.createCart();
  //console.log(user);
  
}).then(cart=>{
  app.listen(3000);
})
.catch(err=>{
  console.log(err);
}); */

/* mongoConnect(()=>{
  app.listen(3000);
}); this is using Mongodb */

mongoose
  .connect(MongoDb_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
