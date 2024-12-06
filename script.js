// document.getElementById("startTest").addEventListener("click", async () => {
//   const downloadSpeedElem = document.getElementById("downloadSpeed");
//   const uploadSpeedElem = document.getElementById("uploadSpeed");

//   // Byte sizes
//   const fileSize = 5 * 1024 * 1024;

//   // Download speed
//   const downloadStartTime = performance.now();
//   await fetch("./File/1"); // Условный большой файл
//   const downloadEndTime = performance.now();
//   const downloadDuration = (downloadEndTime - downloadStartTime) / 1000; // second
//   const downloadSpeed = (fileSize / downloadDuration / (1024 * 1024)).toFixed(
//     2
//   ); // Mbps
//   downloadSpeedElem.textContent = downloadSpeed;

//   // Upload speed
//   const uploadStartTime = performance.now();
//   await fetch("./File/1", {
//     method: "POST",
//     body: new Uint8Array(fileSize), // Ekvivalent məlumatları yükleyirik fileSize
//   });

//   const uploadEndTime = performance.now();
//   const uploadDuration = (uploadEndTime - uploadStartTime) / 1000; // в секундах
//   const uploadSpeed = (fileSize / uploadDuration / (1024 * 1024)).toFixed(2); // Mbps
//   uploadSpeedElem.textContent = uploadSpeed;
// });

document.getElementById("startTest").addEventListener("click", async () => {
  const downloadSpeedElem = document.getElementById("downloadSpeed");
  const finalResultElem = document.getElementById("finalResult");
  const progressBar = document.getElementById("progress");
  const testDuration = 10 * 1000; // 10 секунд
  const updateInterval = 500; // Обновление каждые 500 мс
  const fileSize = 100 * 1024 * 1024; // Размер файла (100MB)

  // Сброс состояния
  downloadSpeedElem.textContent = "0";
  finalResultElem.textContent = "";
  progressBar.style.width = "0%";

  let downloadedBytes = 0;
  let speedSamples = [];
  const startTime = performance.now();

  // Загрузка файла чанками
  const response = await fetch("./File/1");
  const reader = response.body.getReader();

  const updateSpeed = (bytesDownloaded, elapsedTime) => {
    const speedKB = (bytesDownloaded / elapsedTime).toFixed(2); // KB/s
    return speedKB >= 1024
      ? `${(speedKB / 1024).toFixed(2)} MB/s` // Преобразуем в MB/s
      : `${speedKB} KB/s`;
  };

  const interval = setInterval(() => {
    const elapsedTime = (performance.now() - startTime) / 1000; // Секунды
    const progress = (elapsedTime / (testDuration / 1000)) * 100; // Прогресс в %
    progressBar.style.width = `${progress}%`;

    // Рассчитываем и выводим текущую скорость
    const speed = updateSpeed(downloadedBytes, elapsedTime);
    downloadSpeedElem.textContent = speed;

    // Сохраняем данные для среднего значения
    speedSamples.push(downloadedBytes / elapsedTime);
  }, updateInterval);

  while (true) {
    const { done, value } = await reader.read();
    if (done || performance.now() - startTime >= testDuration) break;

    downloadedBytes += value.length;
  }

  clearInterval(interval);

  // Финальный расчет средней скорости
  const averageSpeedKB =
    speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
  finalResultElem.textContent =
    averageSpeedKB >= 1024
      ? `Средняя скорость: ${(averageSpeedKB / 1024).toFixed(2)} MB/s`
      : `Средняя скорость: ${averageSpeedKB.toFixed(2)} KB/s`;
});
