import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const API = axios.create({
  baseURL: "https://hospital-management-one-ruby.vercel.app/api"
})

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})