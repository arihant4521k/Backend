const Table = require('../models/Table.model');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');

exports.createTable = async (req, res) => {
  try {
    const { number } = req.body;
    
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Table number already exists' 
      });
    }

    const qrSlug = nanoid(10);
    
    const table = new Table({
      number,
      qrSlug,
      status: 'available'
    });

    await table.save();

    res.status(201).json({ 
      success: true, 
      data: table 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    
    res.json({ 
      success: true, 
      data: tables 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: 'Table not found' 
      });
    }

    res.json({ 
      success: true, 
      data: table 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// exports.getTableBySlug = async (req, res) => {
//   try {
//     const table = await Table.findOne({ qrSlug: req.params.slug });
    
//     if (!table) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Table not found' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       data: table 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };


exports.getTableBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const table = await Table.findOne({ qrSlug: slug });
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    res.json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: 'Table not found' 
      });
    }

    const menuUrl = `${process.env.FRONTEND_URL}/m/${table.qrSlug}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        url: menuUrl,
        table: table
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: 'Table not found' 
      });
    }

    res.json({ 
      success: true, 
      data: table 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: 'Table not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Table deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};



