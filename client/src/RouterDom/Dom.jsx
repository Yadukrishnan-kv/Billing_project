import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../Components/LoginPage/Login";
import AdminDash from "../Components/DashBoard/AdminDash";
import CustomerList from "../Pages/Sales/CustomerList/CustomerList";
import CreateCustomer from "../Pages/Sales/CreateCustomer/CreateCustomer";
import EditCustomer from "../Pages/Sales/EditCustomer/EditCustomer";
import ViewCustomer from "../Pages/Sales/ViewCustomer/ViewCustomer";
import CreateInvoice from "../Pages/Sales/Invoice/CreateInvoice/CreateInvoice";
import ViewInvoice from "../Pages/Sales/Invoice/ViewInvoice/ViewInvoice";
import SupplierList from "../Pages/Purchase/Suppliers/SupplierList/SupplierList";
import CreateSupplier from "../Pages/Purchase/Suppliers/CreateSupplier/CreateSupplier";
import EditSupplier from "../Pages/Purchase/Suppliers/EditSupplier/EditSupplier";
import SupplierDetails from "../Pages/Purchase/Suppliers/SupplierDetails/SupplierDetails";
import InvoiceList from "../Pages/Sales/Invoice/ViewInvoices/InvoiceList";
import PurchaseList from "../Pages/Purchase/Purchase/PurchaseList/PurchaseList";
import CreatePurchase from "../Pages/Purchase/Purchase/CreatePurchase/CreatePurchase";
import ViewPurchase from "../Pages/Purchase/Purchase/ViewPurchase/ViewPurchase";
import InventoryList from "../Pages/inventory/InventoryList/InventoryList";
import CreateInventory from "../Pages/inventory/CreateInventory/CreateInventory";
import ViewInventory from "../Pages/inventory/ViewInventory/ViewInventory";
import ItemGroupList from "../Pages/ItemGroup/ItemGroupList/ItemGroupList";
import CreateItemGroup from "../Pages/ItemGroup/CreateItemGroup/CreateItemGroup";
import ViewItemGroup from "../Pages/ItemGroup/ViewItemGroup/ViewItemGroup";
import CreateCatalogue from "../Pages/Catalogue/CreateCatalogue/CreateCatalogue";
import CatalogueList from "../Pages/Catalogue/CatalogueList/CatalogueList";
import ViewCatalogue from "../Pages/Catalogue/ViewCatalogue/ViewCatalogue";

function Dom() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<AdminDash />} />
          <Route path="/admin/sales/Customer" element={<CustomerList />} />
          <Route
            path="/admin/sales/Customer/createCustomer"
            element={<CreateCustomer />}
          />
          <Route
            path="/admin/sales/Customer/edit/:id"
            element={<EditCustomer />}
          />
          <Route
            path="/admin/sales/Customer/view/:id"
            element={<ViewCustomer />}
          />

          <Route path="/admin/sales/Invoices" element={<InvoiceList />} />
          <Route
            path="/admin/sales/invoices/create"
            element={<CreateInvoice />}
          />
          <Route
            path="/admin/sales/invoices/edit/:id"
            element={<CreateInvoice />}
          />
          <Route
            path="/admin/sales/invoices/view/:id"
            element={<ViewInvoice />}
          />
         
          <Route path="/admin/purchase/Suppliers" element={<SupplierList />} />
          <Route
            path="/admin/purchase/Suppliers/createSupplier"
            element={<CreateSupplier />}
          />
          <Route
            path="/admin/purchase/Suppliers/edit/:id"
            element={<EditSupplier />}
          />
          <Route
            path="/admin/purchase/Suppliers/details/:id"
            element={<SupplierDetails />}
          />

          <Route path="/admin/Purchase/Purchase-Bill" element={<PurchaseList />} />
          <Route
            path="/admin/purchase/Purchase-Bill/CreatePurchase"
            element={<CreatePurchase />}
          />
          <Route
            path="/admin/purchase/Purchase-Bill/edit/:id"
            element={<CreatePurchase />}
          />
          <Route
            path="/admin/purchase/Purchase-Bill/ViewPurchase/:id"
            element={<ViewPurchase />}
          />
       
       <Route path="/admin/items/Inventory" element={<InventoryList />} />
          <Route
            path="/admin/items/Inventory/CreateInventory"
            element={<CreateInventory />}
          />
          <Route
            path="/admin/items/Inventory/edit/:id"
            element={<CreateInventory />}
          />
          <Route
            path="/admin/items/Inventory/viewInventory/:id"
            element={<ViewInventory />}
          />

          <Route path="/admin/items/Item-Group" element={<ItemGroupList />} />
          <Route
            path="/admin/items/Item-Group/CreateIItem-Group"
            element={<CreateItemGroup />}
          />
          <Route
            path="/admin/items/Item-Group/edit/:id"
            element={<CreateItemGroup />}
          />
          <Route
            path="/admin/items/Item-Group/viewItem-Group/:id"
            element={<ViewItemGroup />}
          />

          <Route path="/admin/items/Catalogue" element={<CatalogueList />} />
          <Route
            path="/admin/items/Catalogue/CreateICatalogue"
            element={<CreateCatalogue />}
          />
          <Route
            path="/admin/items/Catalogue/edit/:id"
            element={<CreateCatalogue />}
          />
          <Route
            path="/admin/items/Catalogue/viewCatalogue/:id"
            element={<ViewCatalogue />}
          />
        
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default Dom;
