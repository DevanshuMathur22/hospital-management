// app/login.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useState } from "react";
import { useRouter } from "expo-router";

import { loginUser } from "../services/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({
        email,
        password,
      });

      console.log("LOGIN RES:", res.data);

      // ❌ invalid login
      if (!res.data?.success) {
        Alert.alert("Error", "Invalid credentials");
        return;
      }

      const { token, role } = res.data;

      // ❌ only patient allowed
      if (role !== "patient") {
        Alert.alert(
          "Access Denied",
          "Only patient login allowed"
        );
        return;
      }

      // ✅ save token
      await AsyncStorage.setItem("token", token);

      console.log("TOKEN SAVED:", token);

      // ✅ redirect
      router.replace("/dashboard" as any);

    } catch (err: any) {
      console.log("LOGIN ERROR:", err);

      Alert.alert(
        "Error",
        err?.response?.data?.error || "Login failed"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={{
        flex: 1,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* 🔥 CARD */}
      <View
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 20,
          elevation: 6,
        }}
      >
        {/* 🔥 TITLE */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 6,
            color: "#111827",
          }}
        >
          Welcome Back 👋
        </Text>

        <Text
          style={{
            color: "#6b7280",
            marginBottom: 24,
            fontSize: 15,
          }}
        >
          Login to continue
        </Text>

        {/* 🔥 EMAIL */}
        <Text
          style={{
            marginBottom: 6,
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Email
        </Text>

        <TextInput
          placeholder="Enter email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 15,
            borderRadius: 14,
            marginBottom: 18,
            backgroundColor: "#f9fafb",
            fontSize: 15,
          }}
        />

        {/* 🔥 PASSWORD */}
        <Text
          style={{
            marginBottom: 6,
            fontWeight: "600",
            color: "#374151",
          }}
        >
          Password
        </Text>

        <TextInput
          placeholder="Enter password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 15,
            borderRadius: 14,
            marginBottom: 24,
            backgroundColor: "#f9fafb",
            fontSize: 15,
          }}
        />

        {/* 🔥 LOGIN BUTTON */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#2563eb",
            padding: 16,
            borderRadius: 14,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}