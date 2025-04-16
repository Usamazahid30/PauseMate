const { BrowserWindow } = require("electron");
const path = require("path");

let blockWindow = null;

function showBlockScreen(duration) {
  if (blockWindow && !blockWindow.isDestroyed()) {
    return;
  }

  blockWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: false,
    backgroundColor: "#000000",
  });

  blockWindow.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`
      <html>
        <head>
          <style>
            body {
              margin: 0;
              background: black; 
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 30px;
              font-family: 'Arial', sans-serif;
              text-align: center;
              overflow: hidden;
            }
            .container {
              max-width: 80%;
              padding: 20px;
              border: 2px solid white;
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.1); 
              box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
              animation: fadeIn 1.5s ease-in-out; 
            }
            .message {
              margin-bottom: 20px;
              animation: slideIn 1.5s ease-in-out; 
            }
            .icon {
              font-size: 80px;
              margin-bottom: 20px;
              animation: bounce 2s infinite; 
            }
            .skip{
              background-color: #fa6400;
              border: none;
              border-radius: 5px;
              color: white;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
              padding: 10px 20px;
              text-align: center;
              transition: background-color 0.3s ease, transform 0.2s ease;
              margin-top: 20px;
              }
             .skip:hover {
               background-color: #fb8332;
               transform: translateY(-2px);
              }
             .skip:active {
               background-color: #c85000;
               transform: translateY(0);
              }
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes slideIn {
              from {
                transform: translateY(50px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            @keyframes bounce {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🧘‍♂️</div>
            <div class="message">Take a short break, mate, and fix your posture!</div>
            <div>Relax, breathe, and stretch for a moment.</div>
            <button id="skip" class="skip">Skip Break</button>
          </div>
          <script>
            document.getElementById("skip").addEventListener("click", () => {
              window.close();
            });
          </script>
        </body>
      </html>
    `)
  );

  blockWindow.once("ready-to-show", () => {
    blockWindow.show();
    blockWindow.focus();
  });

  blockWindow.on("closed", () => {
    blockWindow = null;
  });

  setTimeout(() => {
    if (blockWindow && !blockWindow.isDestroyed()) {
      blockWindow.close();
    }
  }, duration * 1000);
}

module.exports = { showBlockScreen };
