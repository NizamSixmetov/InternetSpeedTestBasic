document.getElementById("startTest").addEventListener("click", async () => {
  const startButton = document.getElementById("startTest");
  const downloadSpeedElem = document.getElementById("downloadSpeed");
  const finalResultElem = document.getElementById("finalResult");
  const resultsDiv = document.getElementById("results");
  const restartButton = document.getElementById("restartTest");
  const h1Element = document.getElementById("h1");

  const testDuration = 10 * 1000; // 10 секунд
  const updateInterval = 50; // Обновление каждые 500 мс
  const fileSize = 10 * 1024 * 1024; // Размер файла (100MB)

  let downloadedBytes = 0;
  let speedSamples = [];
  const startTime = performance.now();

  // Скрываем кнопку и показываем результаты
  startButton.style.opacity = "0";
  resultsDiv.classList.remove("hidden");
  setTimeout(() => {
    resultsDiv.classList.add("visible");
  }, 0);
  h1Element.classList.add("hidden");
  startButton.classList.add("hidden");

  downloadSpeedElem.textContent = "0";
  finalResultElem.textContent = "";

  const response = await fetch("./File/1"); // 1 GB liq fayl ana ekrandadi SpeedFile (GitHub-a getmemek sebebi ile proyekde yoxdu)
  const reader = response.body.getReader();

  const calculateSpeed = (bytes, time) => {
    const speedKB = bytes / time;
    return speedKB >= 1024
      ? `${(speedKB / 1024).toFixed(0)} MB/s`
      : `${speedKB.toFixed(0)} KB/s`;
  };

  const interval = setInterval(() => {
    const elapsedTime = performance.now() - startTime; // Секунды
    const speed = calculateSpeed(downloadedBytes, elapsedTime);
    downloadSpeedElem.textContent = speed;

    speedSamples.push(downloadedBytes / elapsedTime);
  }, updateInterval);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    downloadedBytes += value.length;

    // Завершаем, если тест продолжался достаточно долго
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

  // Показать кнопку для перезапуска
  restartButton.classList.remove("hidden");
});

document.getElementById("restartTest").addEventListener("click", () => {
  // Перезагрузка страницы для начала нового теста
  location.reload();
});
