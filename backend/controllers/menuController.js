import Menu from '../models/Menu.js';

/**
 * @desc    Get all menu items
 * @route   GET /api/menu
 * @access  Public
 */
export const getAllMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;

    // Build filter object
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }

    const menuItems = await Menu.find(filter).sort({ category: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('Get Menu Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu'
    });
  }
};

/**
 * @desc    Get single menu item by ID
 * @route   GET /api/menu/:id
 * @access  Public
 */
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Get Menu Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu item'
    });
  }
};

/**
 * @desc    Add new menu item
 * @route   POST /api/menu
 * @access  Private (Admin only)
 */
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, image, category, description, isAvailable } = req.body;

    // Validation
    if (!name || !price || !image || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, image, and category'
      });
    }

    // Create menu item
    const menuItem = await Menu.create({
      name,
      price,
      image,
      category,
      description,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Add Menu Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding menu item'
    });
  }
};

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 * @access  Private (Admin only)
 */
export const updateMenuItem = async (req, res) => {
  try {
    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Update menu item
    menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true // Run schema validations
      }
    );

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Update Menu Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item'
    });
  }
};

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 * @access  Private (Admin only)
 */
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await Menu.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete Menu Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting menu item'
    });
  }
};

/**
 * @desc    Toggle menu item availability
 * @route   PATCH /api/menu/:id/toggle-availability
 * @access  Private (Admin only)
 */
export const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: `Menu item ${menuItem.isAvailable ? 'marked as available' : 'marked as unavailable'}`,
      data: menuItem
    });
  } catch (error) {
    console.error('Toggle Availability Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling availability'
    });
  }
};
