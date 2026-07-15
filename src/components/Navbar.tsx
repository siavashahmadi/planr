import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white/70 backdrop-blur-md rounded-xl p-3 shadow-sm flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 hover:scale-105 transition">
        <img className="h-7" src="/planr.svg" alt="logo" />
      </Link>

      <div className="flex gap-1">
        <Link
          to="/"
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            location.pathname === "/"
              ? "bg-pink-100 text-pink-600"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Calendar
        </Link>
        <Link
          to="/pomodoro"
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            location.pathname === "/pomodoro"
              ? "bg-pink-100 text-pink-600"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Pomodoro
        </Link>
      </div>

      <div className="w-7" />
    </nav>
  );
};

export default Navbar;
