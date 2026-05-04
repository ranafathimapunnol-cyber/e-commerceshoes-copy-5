import axios from '../../utils/api'

export const fetchProducts = async () => {

  const response = await axios.get('products/')

  return response.data
}