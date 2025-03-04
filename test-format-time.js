// Test the formatTime function with millisecond timestamps

// This is the same function as in TranscriptViewer.jsx
const formatTime = (timeInMilliseconds) => {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Test with various millisecond values
const testTimes = [
  0,           // 00:00
  1000,        // 00:01
  60000,       // 01:00
  61000,       // 01:01
  3600000,     // 01:00:00 (but our format only shows MM:SS)
  28960,       // 00:28 (from our actual data)
  58920,       // 00:58 (from our actual data)
  88920,       // 01:28 (from our actual data)
  118840,      // 01:58 (from our actual data)
  148840       // 02:28 (from our actual data)
];

// Run the tests
testTimes.forEach(time => {
  console.log(`${time} ms = ${formatTime(time)}`);
}); 