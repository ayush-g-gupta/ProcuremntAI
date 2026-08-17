import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ApprovalPage } from "./pages/ApprovalPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrderConfirmedPage } from "./pages/OrderConfirmedPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductsPage } from "./pages/ProductsPage";
import { InventoryAgentPage } from "./pages/InventoryAgentPage";
import { QuotePage } from "./pages/QuotePage";
import { RecommendationPage } from "./pages/RecommendationPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="inventory-agent" element={<InventoryAgentPage />} />
        <Route path="recommendation" element={<RecommendationPage />} />
        <Route path="quotes" element={<QuotePage />} />
        <Route path="approvals" element={<ApprovalPage />} />
        <Route path="order-confirmed" element={<OrderConfirmedPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
