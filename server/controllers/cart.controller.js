const Cart = require('../models/Cart');
const Color = require('../models/Color');

// Get cart for current user
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, finish, quantity } = req.body;
    
    // Fetch product to ensure price and details are accurate
    const product = await Color.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }
    
    const price = product.pricePerUnit || 250;
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && item.finish === finish
    );
    
    if (existingItemIndex > -1) {
      // Increase quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * price;
    } else {
      // Add new item
      cart.items.push({
        productId,
        colorName: product.name,
        colorCode: product.colorCode || '',
        hexCode: product.hex,
        finish,
        quantity,
        price,
        subtotal: quantity * price
      });
    }
    
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });
    
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    
    item.quantity = quantity;
    item.subtotal = item.quantity * item.price;
    
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart item', error: err.message });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items.pull(itemId);
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error removing cart item', error: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
};
