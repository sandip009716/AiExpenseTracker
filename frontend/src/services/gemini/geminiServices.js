import axios from "axios";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

const token = getUserFromStorage();

export const startChatSessionAPI = async () => {
  const res = await axios.post(`${import.meta.env.VITE_API_KEY}/gemini/start`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const sendGeminiMessageAPI = async (prompt) => {
  const res = await axios.post(`${import.meta.env.VITE_API_KEY}/gemini/chat`, { prompt }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
