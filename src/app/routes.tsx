import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import Category from "./pages/Category";
import SearchResults from "./pages/SearchResults";

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/admin", Component: Admin },
  { path: "/cart", Component: Cart },
  { path: "/checkout", Component: Checkout },
  { path: "/order-success", Component: OrderSuccess },
  { path: "/wishlist", Component: Wishlist },
  { path: "/category/:category", Component: Category },
  { path: "/category/:category/:subcategory", Component: Category },
  { path: "/search", Component: SearchResults },
]);
