import { useState } from "react";
import axios from "axios";

function App() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");

  const sendMessage = async () => {
    setStatus("🔄 Enviando...");

    try {
      const response = await axios.post("https://chatbot-production-f73e.up.railway.app/send-message", {
        phone,
      });

      if (response.data.success) {
        setStatus("✅ Mensagem enviada com sucesso!");
      } else {
        setStatus("⚠️ Falha no envio");
      }
    } catch (error) {
      setStatus("❌ Erro: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>📨 Painel de Envio - Twilio Sandbox</h2>
      <input
        type="text"
        placeholder="Número com DDD (ex: 5511999999999)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "300px", padding: "10px", marginBottom: "1rem" }}
      />
      <br />
      <button onClick={sendMessage} style={{ padding: "10px 20px" }}>
        Enviar mensagem
      </button>
      <p style={{ marginTop: "1rem" }}>{status}</p>
    </div>
  );
}

export default App;
