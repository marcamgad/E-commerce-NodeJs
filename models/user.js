/* const Sequelize = require('sequelize');

const sequelize = require('../util/dataBase');

const User = sequelize.define('user',{
  id: { 
    type:Sequelize.INTEGER,
    autoIncrement: true,
    alowNull:false,
    primaryKey: true
  },
  name: {
    type:Sequelize.STRING,
    allowNull: false
  },
  email:{
    type: Sequelize.STRING,
    allowNull: false
  }
});  MySql uses */
/*  This is MongoDb 
const getDb = require('../util/dataBase').getDb();
const mongoDb = require('mongodb');
const { get } = require('../routes/admin');
const ObjectId = mongoDb.ObjectId;

class User{
  constructor(username,email,cart,id){
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }
  save(){
    const db = getDb();
    return db
    .collection('users')
    .insertOne(this);
    
  }
  addToCart(product){
    const cartProduct = this.cart.items.findIndex(cp=>{
      return cp.productId == product._id;
    });
    let newQuantity = 1;
    const updateCartItems = [...this.cart.items];
    if(cartProductIndex =0){
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updateCartItems[cartProductIndex].quantity = newQuantity;
    }else{
      updateCartItems.push({productId: new ObjectId(product._id),quantity: 1});
    }
    const updatedCart = {items:[{productId: new ObjectId(product._id),quantity: 1}]};
    const db = getDb();
    return db
    .collection('users')
    .updateOne({_id: new ObjectId(this._id)},
    {$set : {cart:updatedCart}});
  }
  getCart(){
    const db = getDb();
    const productIds = this.cart.items.map(i=>{
      return i.productId;
    });
    return db
    .collection('products')
    .find({_id: {$sin: [productIds]}})
    .toArray()
    .then(products=>{
      return products.map(p=>{
        return {...p, quantity: this.cart.items.find(i=>{
          return i.productId.toString() === p._id.toString();
        }).quantity
      };
      })
    });
  }
  deleteItemFromCart(productId){
    const updateCartItems = this.cart.items.filter(item=>{
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db.collection('users')
    .updateOne(
      {_id : new ObjectId(this._id)},
      {$set : {cart: {items: updateCartItems}}}
    );
  }
  addOrder(){
    const db = getDb();
    return this.getCart()
    .then(products=>{
      const order = {
        items: products,
        user: {
          _id: new ObjectId(this._id),
          username: this.username
        }
      };
      return db.collection('orders').insertOne(this.cart)
    })
      .then(result=>{
        this.cart = {items: []};
      return db.collection('users')
    .updateOne(
      {_id : new ObjectId(this._id)},
      {$set : {cart: {items: []}}}
    );
    });
  }
  getOrders(){
    const db = getDb();
    db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray()
  }
  static findById(userId){
    const db = getDb();
    return db
    .collection('users')
    .findOne({ _id: new ObjectId.createFromTime(userId) })
    .then(user=>{
      console.log(user);
      return user;
    })
    .catch(err=> console.log(err));
    
  }
}

module.exports = User;   */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true
  // },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String ,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);