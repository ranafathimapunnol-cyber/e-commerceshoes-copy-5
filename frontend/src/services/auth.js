import axios from 'axios';
export const loginUser = async (username, password) => {
  const response = await axios.post(
    "/api/token/",
    {
      username,
      password
    }
  );

  return response.data;
};