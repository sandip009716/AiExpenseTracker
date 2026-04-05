import React, { useEffect, useState, useRef } from "react";
import { startChatSessionAPI, sendGeminiMessageAPI } from "../../services/gemini/geminiServices";
import { FaMicrophone, FaMicrophoneSlash, FaStop } from "react-icons/fa";

const ChatBotPage = () => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        voicesRef.current = voices;
        setVoicesReady(true);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 500);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (e) => {
        const voiceText = e.results[0][0].transcript;
        setPrompt(voiceText);
        setListening(false);
        handleSend(voiceText);
      };
      recognition.onend = recognition.onerror = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (!voicesReady) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await startChatSessionAPI();
        if (res && res.reply) {
          const reply = cleanText(res.reply);
          setMessages([{ sender: "bot", text: reply }]);
          speakText(reply);
        } else {
          throw new Error("No response from assistant");
        }
      } catch (err) {
        console.error("Init Error:", err);
        setError("Failed to connect to Gemini. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, [voicesReady]);

  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    const voice = voicesRef.current.find(v => v.gender?.toLowerCase() !== "female") || voicesRef.current[0];
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };

  const cleanText = (text) => text?.replace(/[*_`#>-]/g, "").trim();

  const handleSend = async (inputText = prompt) => {
    if (!inputText.trim()) return;
    setMessages((m) => [...m, { sender: "user", text: inputText }]);
    setPrompt("");
    setLoading(true);
    setError(null);
    try {
      const res = await sendGeminiMessageAPI(inputText);
      if (res && res.reply) {
        const reply = cleanText(res.reply);
        setMessages((m) => [...m, { sender: "bot", text: reply }]);
        speakText(reply);
      } else {
        throw new Error("No response from assistant");
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((m) => [...m, { sender: "bot", text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (listening) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
    setListening(!listening);
  };

  return (
    <div className="h-[92vh] flex flex-col bg-gray-100 ">
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 text-center text-xl font-bold shadow-md">
      Your Personal Finance Assistant
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl text-sm shadow-md ${
              msg.sender === "user"
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-white text-gray-800 rounded-bl-none border"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-700 border p-3 rounded-xl text-sm shadow-md animate-pulse">
              Gemini is typing...
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t flex flex-col md:flex-row gap-2 md:gap-0 items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask something about your spending..."
          className="flex-1 p-2.5 border border-gray-300 rounded-lg md:rounded-l-lg md:rounded-r-none focus:outline-none"
        />
        <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg md:rounded-none md:rounded-r-lg font-semibold transition">
          Send
        </button>
        <button onClick={toggleMic} className={`ml-2 px-4 py-3 rounded-lg transition ${listening ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}>
          {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button onClick={() => window.speechSynthesis.cancel()} className="ml-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition">
          <FaStop />
        </button>
      </div>
    </div>
  );
};

export default ChatBotPage;
