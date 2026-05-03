import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import LowStock from "./pages/LowStock";
import Sales from "./pages/Sales";
import Analytics from "./pages/Analytics";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import AuditLogs from "./pages/AuditLogs";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DemandPrediction from "./pages/DemandPrediction";

const P = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <P>
              <Dashboard />
            </P>
          }
        />
        <Route
          path="/products"
          element={
            <P>
              <Products />
            </P>
          }
        />
        <Route
          path="/low-stock"
          element={
            <P>
              <LowStock />
            </P>
          }
        />
        <Route
          path="/sales"
          element={
            <P>
              <Sales />
            </P>
          }
        />
        <Route
          path="/analytics"
          element={
            <P>
              <Analytics />
            </P>
          }
        />
        <Route
          path="/suppliers"
          element={
            <P>
              <Suppliers />
            </P>
          }
        />
        <Route
          path="/reports"
          element={
            <P>
              <Reports />
            </P>
          }
        />
        <Route
          path="/users"
          element={
            <P>
              <Users />
            </P>
          }
        />
        <Route
          path="/settings"
          element={
            <P>
              <Settings />
            </P>
          }
        />
        <Route
          path="/audit"
          element={
            <P>
              <AuditLogs />
            </P>
          }
        />
        <Route
          path="/ai"
          element={
            <P>
              <AIAssistant />
            </P>
          }
        />
        <Route
          path="/profile"
          element={
            <P>
              <Profile />
            </P>
          }
        />
        <Route
          path="/demand"
          element={
            <P>
              <DemandPrediction />
            </P>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
