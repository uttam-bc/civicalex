document.getElementById("ai-send-btn").addEventListener("click", sendMsg);
document
  .getElementById("ai-chat-input")
  .addEventListener("keydown", (e) => e.key === "Enter" && sendMsg());

async function sendMsg() {
  const input = document.getElementById("ai-chat-input");
  const text = input.value.trim();
  if (!text) return;

  const chatBox = document.getElementById("ai-chat-messages");

  chatBox.innerHTML += `
    <div class="message user-message"><p>${text}</p></div>
  `;

  input.value = "";

  const csrfToken = document.getElementById("csrf-token").value;

  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();

  chatBox.innerHTML += `
    <div class="message bot-message"><p>${data.reply}</p></div>
  `;

  chatBox.scrollTop = chatBox.scrollHeight;
}
