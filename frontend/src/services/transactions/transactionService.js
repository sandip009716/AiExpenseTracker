import axios from "axios";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

//! Get the token
const token = getUserFromStorage();

//! Add
export const addTransactionAPI = async ({
  type,
  category,
  date,
  description,
  amount,
}) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_KEY}/transactions/create`,
    {
      category,
      date,
      description,
      amount,
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
// export const updateCategoryAPI = async ({ name, type, id }) => {
//   const response = await axios.put(
//     `${import.meta.env.VITE_API_KEY}/transactions/update/${id}`,
//     {
//       name,
//       type,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   //Return a promise
//   return response.data;
// };

//! delete
export const deleteCategoryAPI = async (id) => {

  const response = await axios.delete(`${import.meta.env.VITE_API_KEY}/transactions/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  //Return a promise
  return response.data;
};

//! lists
export const listTransactionsAPI = async ({
  category,
  type,
  startDate,
  endDate,
}) => {
  const response = await axios.get(`${import.meta.env.VITE_API_KEY}/transactions/lists`, {
    params: { category, endDate, startDate, type },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  //Return a promise
  return response.data;
};

//! API to extract transaction from voice
export const extractTransactionFromVoiceAPI = async (input) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_KEY}/gemini/extract-transaction`,
    { input },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data; 
};