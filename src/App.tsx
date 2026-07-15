import { BrowserRouter, Routes, Route } from "react-router-dom";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Calendar from "./components/Calendar";
import DailyView from "./components/DailyView";
import Pomodoro from "./components/Pomodoro";

function App() {
  return (
    <BrowserRouter>
      <Background>
        <div className="p-2 max-w-7xl mx-auto">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <div className="lg:flex gap-3 mt-3">
                  <Calendar />
                  <DailyView />
                </div>
              }
            />
            <Route path="/pomodoro" element={<Pomodoro />} />
          </Routes>
        </div>
      </Background>
    </BrowserRouter>
  );
}

export default App;
