import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="*"
          element={
            <div className="max-w-xl mx-auto px-6 py-32 text-center">
              <h1 className="font-display text-5xl text-white mb-4">Page not found</h1>
              <a href="/" className="text-accent hover:underline">
                Back to home
              </a>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
