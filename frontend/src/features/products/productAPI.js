import api from '../../services/api'

export const fetchProducts = async () => {

  const response = await api.get('products/')

  return response.data
}