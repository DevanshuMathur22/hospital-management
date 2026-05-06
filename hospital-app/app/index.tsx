import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
} from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);

  const [token, setToken] =
    useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      </View>
    );
  }

  return token ? (
    <Redirect href="/dashboard" />
  ) : (
    <Redirect href="/login" />
  );
}