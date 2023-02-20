const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ecomerceDB');
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true
  }));

const date = new Date();
const year = date.getFullYear();
const itemSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    price : {
        type: Number,
        default: 0.0 
    },

    sales_price: Number,

    quantity : {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});

const Items = mongoose.model('Items', itemSchema);

const cartSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    price : {
        type: Number,
        default: 0.0 
    },

    sales_price: {
        type: Number,
        default: 0.0 
    },

    quantity : {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true,
    },
    subtotal : {
        type: Number,
        default: 0.0 
    },
    total : {
        type: Number,
        default: 0.0 
    },
});

const CartProduct = mongoose.model('CartProduct', cartSchema);


const item1 = {
    name: 'Samsung s20',
    description: 'samsung smartphone 32gb storage',
    price: 399.0,
    quantity: 5,
    image: "images/1.png",
    category: "smartphone",
    type: "samsung"
}
const item2 = {
    name: "Iphone 13",
    description: "32gb 7",
    price: 799.0,
    sales_price: 699.0,
    quantity:10,
    image: "images/2.png",
    category: "smartphone",
    type: "iphone"
}
const item3 = {
    name: "Iphone 14",
    description: "32gb 8",
    price: 899.0,
    sales_price: 799.0,
    quantity:10,
    image: "images/3.png",
    category: "smartphone",
    type: "iphone"
}
const item4 = {
    name: "Samsung",
    description: "Samsung 8 32gb",
    price: 799.0,
    sales_price: 699.0,
    quantity: 10,
    image: "images/4.png",
    category: "smartphone",
    type: "Samsung"
}
const item5 = {
    name: "Panasonic 9",
    description: "Panasonic 9 32gb",
    price: 899.0,
    sales_price: 699.0,
    quantity: 10,
    image: "images/5.png",
    category: "smartphone",
    type: "Panasonic"
}
const item6 = {
    name: "ig 8",
    description: "ig 8 32gb",
    price: 799.0,
    sales_price: 699.0,
    quantity: 10,
    image: "images/6.png",
    category: "smartphone",
    type: "Ig"
}

var theItems = [item1, item2, item3, item4, item5, item6];

app.get('/', (req, res) => {
    Items.find({}, (err, docs) => {
        if (docs.length == 0) {
            Items.insertMany(theItems, (err) => {
                if (!err) {
                  res.redirect('/');
                } else {
                    console.log(err);
                }
              });
          
        } else {
            res.render('./pages/index', {allItems:docs, theYear:year});
        }
      })
    
})


app.post('/add_to_cart', (req, res) => {
    var Product = new CartProduct({
    name: req.body.name,
    price: req.body.price,
    sales_price: req.body.sales_price,
    quantity: req.body.quantity,
    image: req.body.image
    });
    console.log(req.body);
    CartProduct.findOne({image: Product.image}, (err, doc) => {
        if (!doc) {
            Product.save();
            res.redirect('/cart')
        }
    })
})

app.post('/cart_product', (req, res) => {
    var submit = req.body.submit;
    var price =  parseInt(req.body.price);
    var total = req.body.total;
    var name = req.body.name;
    var quantity =  parseInt(req.body.quantity);
    var sub_total = req.body.sub_total;
    if (submit == 'add') {
        quantity = quantity + 1;
        
    } else if (submit == 'subtract') {
        quantity = quantity - 1;
    } 
    sub_total = quantity * price;
    console.log(name)
    CartProduct.findOneAndUpdate({name: name}, { quantity:quantity, subtotal:sub_total },{ new: true },(err, results) =>{
        if (err) {
            console.log(err);
        }
        res.redirect('/cart');
    })

    
})

app.post('/delete_cart', (req, res) => {
    var submit = req.body.submit;
    var name = req.body.name;

    if (submit == 'remove') {
        CartProduct.findOneAndDelete({name: name}, (err, results) => {
            if (err) {
                console.log(err)
            } else {
              res.redirect('/cart');
            }
        })
    }
})

app.get('/cart', (req, res) => {
    CartProduct.find({}, (err, results) =>{
        var subTotalArray = [];
        var sum = 0;
        for (var i = 0; i < results.length; i++) {
            subTotalArray.push(results[i].subtotal);
        }
        for (let i = 0; i < subTotalArray.length; i++) {  
            sum += subTotalArray[i];
          }
        if (err) {
            console.log(err);
        } else {
            res.render('./pages/cart', {theProduct:results, total:sum, theYear:year});
        }
    })
    
})

app.listen(3000, () => {
    console.log('Server up and running');
})