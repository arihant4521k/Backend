const MenuItem = require('../models/MenuItem.model.js');
const MenuCategory = require('../models/MenuCategory.model.js');

exports.getCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find({ active: true })
      .sort({ displayOrder: 1 });
    
    res.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      sort = 'name', 
      page = 1, 
      limit = 20,
      availability 
    } = req.query;

    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.categoryId = category;
    }
    
    if (availability !== undefined) {
      query.availability = availability === 'true';
    } else {
      query.availability = true;
    }

    let sortQuery = {};
    switch (sort) {
      case 'price-asc':
        sortQuery = { price: 1 };
        break;
      case 'price-desc':
        sortQuery = { price: -1 };
        break;
      case 'popularity':
        sortQuery = { popularity: -1 };
        break;
      default:
        sortQuery = { name: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await MenuItem.find(query)
      .populate('categoryId', 'name')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MenuItem.countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
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

exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('categoryId', 'name');
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      data: item 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new MenuCategory(req.body);
    await category.save();
    
    res.status(201).json({ 
      success: true, 
      data: category 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      data: category 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    console.log(req.file)
    if (req.file) {
      item.imageUrl = req.file ? req.file.path : null
    }
    
    await item.save();
    
    res.status(201).json({ 
      success: true, 
      data: item 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    if (req.file) {
      // req.body.imageUrl = `/uploads/${req.file.filename}`;
      req.body.imageUrl = req.file ? req.file.path : null
    }
    
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      data: item 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
