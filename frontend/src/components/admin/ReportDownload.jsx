export default function ReportDownload() {
  return (
    <div className="flex flex-col gap-3">
      <button className="bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200 text-left">Download User Activity Logs</button>
      <button className="bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200 text-left">Download Feedback History</button>
      <button className="bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200 text-left">Download Swap Statistics</button>
    </div>
  );
}
