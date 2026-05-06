import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { API } from "../../services/api";

export default function AppointmentHistory() {
  const [appointments, setAppointments] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    API.get("/appointments?type=history")
      .then((res) => {
        setAppointments(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      })
      .catch((err) => {
        console.log(err);
        setAppointments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔥 FILTER
  const filtered = appointments.filter((a) => {
    const doctor =
      a.doctor?.name?.toLowerCase() || "";

    return doctor.includes(
      search.toLowerCase()
    );
  });

  // 🔥 LOADING
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f3f4f6",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

        <Text
          style={{
            marginTop: 10,
            color: "#6b7280",
          }}
        >
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 16,
      }}
    >
      {/* 🔥 TITLE */}
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 18,
          color: "#111827",
        }}
      >
        Appointment History
      </Text>

      {/* 🔥 SEARCH */}
      <TextInput
        placeholder="Search doctor..."
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          padding: 14,
          borderRadius: 14,
          marginBottom: 18,
          backgroundColor: "#fff",
          fontSize: 15,
        }}
      />

      {/* 🔥 EMPTY */}
      {filtered.length === 0 ? (
        <View
          style={{
            marginTop: 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#6b7280",
              fontSize: 15,
            }}
          >
            No appointment history found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) =>
            item._id?.toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 18,
                borderRadius: 18,
                marginBottom: 14,
                elevation: 3,
              }}
            >
              {/* 🔥 DOCTOR */}
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                Dr.{" "}
                {item.doctor?.name ||
                  "Unknown"}
              </Text>

              {/* 🔥 DATE */}
              <Text
                style={{
                  color: "#6b7280",
                  marginTop: 6,
                }}
              >
                {new Date(
                  item.date
                ).toDateString()}
              </Text>

              {/* 🔥 TIME */}
              <Text
                style={{
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                Time: {item.time}
              </Text>

              {/* 🔥 STATUS */}
              <View
                style={{
                  marginTop: 10,
                  alignSelf: "flex-start",
                  backgroundColor:
                    item.status ===
                    "completed"
                      ? "#dcfce7"
                      : "#fee2e2",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color:
                      item.status ===
                      "completed"
                        ? "#16a34a"
                        : "#dc2626",
                    textTransform:
                      "capitalize",
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}