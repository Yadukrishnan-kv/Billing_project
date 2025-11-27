// controllers/catalogueController.js
const Catalogue = require('../models/Catalogue');

const createCatalogue = async (req, res) => {
  try {
    const catalogueData = req.body;
    const catalogue = new Catalogue(catalogueData);
    await catalogue.save();
    res.status(201).json({ success: true, message: 'Catalogue created successfully', data: catalogue });
  } catch (error) {
    console.error('Error creating catalogue:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// controllers/catalogueController.js

const getAllCatalogues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Catalogue.countDocuments(query);
    const catalogues = await Catalogue.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // For dropdowns: just return array
    // For list page: return with pagination
    if (req.query.dropdown === 'true') {
      return res.json(catalogues); // plain array
    }

    res.json({
      success: true,
      data: catalogues,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ success: false, message: 'Catalogue not found' });
    res.status(200).json({ success: true, data: catalogue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!catalogue) return res.status(404).json({ success: false, message: 'Catalogue not found' });
    res.status(200).json({ success: true, message: 'Catalogue updated', data: catalogue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findByIdAndDelete(req.params.id);
    if (!catalogue) return res.status(404).json({ success: false, message: 'Catalogue not found' });
    res.status(200).json({ success: true, message: 'Catalogue deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
  createCatalogue,
  getAllCatalogues,
  getCatalogueById,
  updateCatalogue,
  deleteCatalogue,
  
};