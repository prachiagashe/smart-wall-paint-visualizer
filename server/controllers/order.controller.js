const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Color = require('../models/Color');

// Create a new order from cart payload
exports.createOrder = async (req, res) => {
  try {
    const { items, customerName, email, phone, address, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    let calculatedSubtotal = 0;
    const orderItems = [];

    // Recalculate price on backend to prevent tampering
    for (const item of items) {
      const product = await Color.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      
      const price = product.pricePerUnit || 250;
      const subtotal = price * item.quantity;
      calculatedSubtotal += subtotal;
      
      orderItems.push({
        productId: product._id,
        colorName: product.name,
        colorCode: product.colorCode || '',
        hexCode: product.hex,
        finish: item.finish,
        quantity: item.quantity,
        price,
        subtotal
      });
    }

    const tax = Math.round(calculatedSubtotal * 0.18); // 18% Tax
    const deliveryCharge = calculatedSubtotal > 1000 ? 0 : 50;
    const discount = 0;
    const totalAmount = calculatedSubtotal + tax + deliveryCharge - discount;

    const orderNumber = `SP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderNumber,
      userId: req.user.id,
      items: orderItems,
      subtotal: calculatedSubtotal,
      tax,
      deliveryCharge,
      discount,
      totalAmount,
      customerName,
      email,
      phone,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed', // Simulating successful online payment
      orderStatus: 'Placed'
    });

    await order.save();
    
    // Empty the user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// Get orders for current user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order details', error: err.message });
  }
};
