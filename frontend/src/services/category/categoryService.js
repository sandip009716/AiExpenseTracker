import axios from "axios";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

//! Get the token
const token = getUserFromStorage();

//! Add
export const addCategoryAPI = async ({ name, type }) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_KEY}/categories/create`,
    {
      name,
      type,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  //Return a promise
  return response.data;
};

//! update
export const updateCategoryAPI = async ({ name, type, id }) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_KEY}/categories/update/${id}`,
    {
      name,
      type,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  //Return a promise
  return response.data;
};

//! delete
export const deleteCategoryAPI = async (id) => {
  const response = await axios.delete(`${import.meta.env.VITE_API_KEY}/categories/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  //Return a promise
  return response.data;
};

//! lists
export const listCategoriesAPI = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_KEY}/categories/lists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  //Return a promise
  return response.data;
};

//! Extract category from voice input using Gemini
export const extractCategoryFromVoiceAPI = async (input) => {
 
  const response = await axios.post(
    `${import.meta.env.VITE_API_KEY}/gemini/extract-category`,
    { input},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } 
  );

  return response.data;
};
