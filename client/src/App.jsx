import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import EditArticlePage from "./pages/EditArticlePage.jsx";
import MyUploadsPage from "./pages/MyUploadsPage.jsx";

const App = () => (
  <div className="app-shell">
    <Header />
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/publish"
          element={
            <ProtectedRoute adminOnly>
              <PublishPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-article/:slug"
          element={
            <ProtectedRoute adminOnly>
              <EditArticlePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-uploads"
          element={
            <ProtectedRoute adminOnly>
              <MyUploadsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
