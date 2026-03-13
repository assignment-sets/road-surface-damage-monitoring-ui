import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import { Navbar } from "./components/layout/Navbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground dark">
        <Navbar />

        <main className="pb-10 pt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>

        <Toaster theme="dark" position="bottom-right" richColors />
      </div>
    </Router>
  );
}

export default App;
