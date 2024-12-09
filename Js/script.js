document.getElementById("startTest").addEventListener("click", async () => {
  const startButton = document.getElementById("startTest");
  const downloadSpeedElem = document.getElementById("downloadSpeed");
  const finalResultElem = document.getElementById("finalResult");
  const resultsDiv = document.getElementById("results");
  const restartButton = document.getElementById("restartTest");

  const testDuration = 10 * 1000;
  const updateInterval = 50;

  let downloadedBytes = 0;
  let speedSamples = [];
  const startTime = performance.now();

  // Qizledib gosermek
  startButton.style.opacity = "0";
  resultsDiv.classList.remove("hidden");
  resultsDiv.classList.add("visible");
  startButton.classList.add("hidden");

  downloadSpeedElem.textContent = "0 MB/s";
  finalResultElem.textContent = "";

  const response = await fetch("../File/1"); // 1 GB liq fayl ana ekrandadi SpeedFile (GitHub-a getmemek sebebi ile proyekde yoxdu)
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

    // Stop edirik test cox zaman aldisa
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
      ? `Ortalama sürət: ${(averageSpeedKB / 1024).toFixed(0)} MB/s`
      : `Ortalama sürət: ${averageSpeedKB.toFixed(0)} KB/s`;

  // Yeniden baslat Buttonu gostermek
  restartButton.classList.remove("hidden");
});

document.getElementById("restartTest").addEventListener("click", () => {
  // Sehifeni yeniley ve baslat button qelir
  location.reload();
});
