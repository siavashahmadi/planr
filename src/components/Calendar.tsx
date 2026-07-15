import MonthGrid from "./MonthGrid";
import { useMonthTasks } from "../hooks/useMonthTasks";
import { useTaskStore } from "../store/taskStore";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Calendar = () => {
  const {
    selectedDate,
    selectedYear,
    selectedMonth,
    refreshKey,
    setSelectedDate,
    setSelectedYear,
    setSelectedMonth,
  } = useTaskStore();

  const { summaries, loading } = useMonthTasks(selectedYear, selectedMonth, refreshKey);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-xl p-3">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 transition text-gray-500 text-lg"
        >
          &#8249;
        </button>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-lg font-semibold text-gray-700 cursor-pointer focus:outline-none"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-lg font-semibold text-gray-700 cursor-pointer focus:outline-none"
          >
            {Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 transition text-gray-500 text-lg"
        >
          &#8250;
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-gray-400">
          Loading...
        </div>
      ) : (
        <MonthGrid
          year={selectedYear}
          month={selectedMonth}
          summaries={summaries}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}
    </div>
  );
};

export default Calendar;
