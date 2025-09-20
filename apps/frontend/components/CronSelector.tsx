import { useState } from "react";

function CronBuilder({ setMetadata }: { setMetadata: (params: Record<string, unknown>) => void }) {
  const [seconds, setSeconds] = useState("*");
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  const cronExpr = `${seconds} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  return (
    <div className="bg-gray-900 text-gray-200 p-6 rounded-2xl shadow-lg max-w-xl mx-auto space-y-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-white">Custom Schedule</h2>

      {/* Cron Preview */}
      <div className="flex justify-center space-x-2 text-lg font-mono bg-gray-800 p-3 rounded-xl">
        <span>{cronExpr.split(" ").join("  ")}</span>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Seconds (0-59)</label>
          <input
            type="text"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            placeholder="*"
          />
        </div>        
        <div>
          <label className="block text-sm mb-1">Minute (0-59)</label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            placeholder="*"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hour (0-23)</label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            placeholder="*"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Day of Month (1-31)</label>
          <input
            type="text"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            placeholder="*"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Month (1-12)</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            placeholder="*"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Day of Week (0=Sun - 6=Sat)</label>
          <input
            type="text"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            placeholder="*"
          />
        </div>
      </div>      

      {/* Save Button */}
      <button
        onClick={() => setMetadata({ cronExpr })}
        className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-2 text-white font-semibold"
      >
        Set Schedule
      </button>
    </div>
  );
}

export default CronBuilder;
