import axios from "axios"

// Configuração da API para o backend Python (FastAPI)
const aiApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ML_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutos timeout para IA (APIs ML podem demorar muito mais)
})

// Interceptor para adicionar token de autenticação
aiApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Interceptor para tratamento de erros
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Timeout: A IA está demorando para responder. Tente novamente."
    } else if (error.response?.status === 500) {
      error.message = "Erro interno do servidor de IA. Verifique se o serviço está funcionando."
    } else if (error.response?.status === 404) {
      error.message = "Serviço de IA não encontrado. Verifique se está rodando na porta 8001."
    }
    return Promise.reject(error)
  },
)

export default aiApi
