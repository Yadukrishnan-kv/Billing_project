const express =require('express');
const dotenv=require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
const customerRoutes = require('./routes/customerRoutes');
app.use('/api/customers', customerRoutes);
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);
const supplierRoutes = require('./routes/supplierRoutes');
app.use('/api/suppliers', supplierRoutes);
const purchaseRoutes = require('./routes/purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventories', inventoryRoutes);
const itemGroupRoutes = require('./routes/itemGroupRoutes');
app.use('/api/itemgroups', itemGroupRoutes);
const catalogueRoutes = require('./routes/catalogueRoutes');
app.use('/api/catalogues', catalogueRoutes);

app.get('/api/ping',(res,req)=>{
    res.send("Server is running up fine");
})

const port = process.env.PORT ;
app.listen(port, (err) => {
  if (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
  console.log(`Server is running on port ${port}`);
});


