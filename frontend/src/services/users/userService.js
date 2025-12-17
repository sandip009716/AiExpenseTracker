import axios from "axios";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
//! Get the token
const token = getUserFromStorage();

//! Login
export const loginAPI = async ({ email, password }) => {
  const response = await axios.post(`${import.meta.env.VITE_API_KEY}/users/login`, {
    email,
    password,
  });
  //Return a promise
  return response.data;
};

//! register
export const registerAPI = async ({ email, password, username }) => {
  const response = await axios.post(`${import.meta.env.VITE_API_KEY}/users/register`, {
    email,
    password,
    username,
  });
  //Return a promise
  return response.data;
};

//! change password
export const changePasswordAPI = async (newPassword) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_KEY}/users/change-password`,
    {
      newPassword,
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

//! update Profile
export const updateProfileAPI = async ({ email, username }) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_KEY}/users/update-profile`,
    {
      email,
      username,
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