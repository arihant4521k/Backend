const Order = require('../models/Order.model');
const MenuItem = require('../models/MenuItem.model');
const Table = require('../models/Table.model');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, sessionToken } = req.body;

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: 'Table not found' 
      });
    }

    let orderItems = [];
    let subtotal = 0;

    for (let item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.availability) {
        return res.status(400).json({ 
          success: false, 
          message: `Item ${item.menuItemId} not available` 
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        note: item.note || ''
      });

      menuItem.popularity += item.quantity;
      await menuItem.save();
    }

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const order = new Order({
      tableId,
      customerId: req.userId || null,
      items: orderItems,
      subtotal,
      tax,
      total,
      sessionToken: sessionToken || null,
      status: 'placed'
    });

    await order.save();

    table.status = 'occupied';
    await table.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('tableId', 'number')
      .populate('items.menuItemId', 'name price');

    res.status(201).json({ 
      success: true, 
      data: populatedOrder 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, table, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (table) {
      query.tableId = table;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(query)
      .populate('tableId', 'number')
      .populate('customerId', 'name email')
      .populate('items.menuItemId', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('tableId', 'number')
      .populate('customerId', 'name email')
      .populate('items.menuItemId', 'name price imageUrl');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('tableId', 'number')
    .populate('items.menuItemId', 'name price');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (status === 'served' || status === 'canceled') {
      const table = await Table.findById(order.tableId);
      if (table) {
        const activeOrders = await Order.countDocuments({
          tableId: table._id,
          status: { $in: ['placed', 'preparing', 'ready'] }
        });
        
        if (activeOrders === 0) {
          table.status = 'available';
          await table.save();
        }
      }
    }

    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.userId })
      .populate('tableId', 'number')
      .populate('items.menuItemId', 'name price imageUrl')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    const categoryRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $ne: 'canceled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $lookup: {
          from: 'menucategories',
          localField: 'menuItem.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          revenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          },
          itemsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const topItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $ne: 'canceled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          revenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        orderStats: stats,
        categoryRevenue,
        topItems
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
