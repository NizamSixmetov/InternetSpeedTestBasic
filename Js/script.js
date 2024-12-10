document.getElementById("startTest").addEventListener("click", async () => {
  const startButton = document.getElementById("startTest");
  const downloadSpeedElem = document.getElementById("downloadSpeed");
  const finalResultElem = document.getElementById("finalResult");
  const resultsDiv = document.getElementById("results");
  const restartButton = document.getElementById("restartTest");

  const pingElem = document.createElement("div");
  pingElem.id = "ping";
  pingElem.textContent = "Ping: 0 ms";
  resultsDiv.insertBefore(pingElem, finalResultElem);

  const uploadSpeedElem = document.createElement("div");
  uploadSpeedElem.id = "uploadSpeed";
  uploadSpeedElem.textContent = "Upload Speed: 0";
  resultsDiv.insertBefore(uploadSpeedElem, finalResultElem);

  const testDuration = 10 * 1000;
  const updateInterval = 50;

  let downloadedBytes = 0;
  let speedSamples = [];
  const startTime = performance.now();

  // Показать элементы
  startButton.style.opacity = "0";
  resultsDiv.classList.remove("hidden");
  resultsDiv.classList.add("visible");
  startButton.classList.add("hidden");

  downloadSpeedElem.textContent = "0 MB/s";
  finalResultElem.textContent = "";

  // 1. Измерение Ping
  const measurePing = async () => {
    const startPing = performance.now();
    await fetch("https://www.google.com", { mode: "no-cors" });
    const endPing = performance.now();
    return Math.round(endPing - startPing);
  };

  // 2. Измерение Upload Speed
  const measureUploadSpeed = async () => {
    const data = new Uint8Array(1024 * 512); // 512 KB
    const startUpload = performance.now();
    await fetch("/upload", { method: "POST", body: data });
    const endUpload = performance.now();
    const duration = endUpload - startUpload;
    const speedKB = data.length / duration; // KB/s
    return speedKB >= 1024
      ? `${(speedKB / 1024).toFixed(0)} MB/s`
      : `${speedKB.toFixed(0)} KB/s`;
  };

  // Обновляем Ping и Unloaded Ping
  setInterval(async () => {
    const ping = await measurePing();
    pingElem.textContent = `Ping: ${ping} ms`;
  }, 1000);

  // 3. Измерение Download Speed
  const response = await fetch("../File/SpeedFile.mp3");
  const reader = response.body.getReader();

  const calculateSpeed = (bytes, time) => {
    const speedKB = bytes / time;
    return speedKB >= 1024
      ? `${(speedKB / 1024).toFixed(0)} MB/s`
      : `${speedKB.toFixed(0)} KB/s`;
  };

  const interval = setInterval(() => {
    const elapsedTime = performance.now() - startTime;
    const speed = calculateSpeed(downloadedBytes, elapsedTime);
    downloadSpeedElem.textContent = speed;

    speedSamples.push(downloadedBytes / elapsedTime);
  }, updateInterval);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    downloadedBytes += value.length;

    if (performance.now() - startTime >= testDuration) {
      reader.cancel();
      break;
    }
  }

  clearInterval(interval);

  const averageSpeedKB =
    speedSamples.reduce((sum, speed) => sum + speed, 0) / speedSamples.length;

  finalResultElem.textContent =
    averageSpeedKB >= 1024
      ? `Средняя скорость: ${(averageSpeedKB / 1024).toFixed(0)} MB/s`
      : `Средняя скорость: ${averageSpeedKB.toFixed(0)} KB/s`;

  // Обновляем Upload Speed
  const uploadSpeed = await measureUploadSpeed();
  uploadSpeedElem.textContent = `Upload Speed: ${uploadSpeed}`;

  restartButton.classList.remove("hidden");
});

document.getElementById("restartTest").addEventListener("click", () => {
  location.reload();
});
