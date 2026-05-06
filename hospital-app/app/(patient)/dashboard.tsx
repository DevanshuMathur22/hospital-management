import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";

import { useEffect, useState } from "react";

import { API } from "../../services/api";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      total: 0,
      upcoming: 0,
      prescriptions: 0,
    });

  const [activity, setActivity] =
    useState<any[]>([]);

  // 🔥 LOAD DASHBOARD
  useEffect(() => {
    const load = async () => {
      try {
        const token =
          await AsyncStorage.getItem(
            "token"
          );

        const res = await API.get(
          "/patient/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(
          res.data.stats || {}
        );

        setActivity(
          res.data.activity || []
        );
      } catch (err) {
        console.log(
          "DASHBOARD ERROR:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔥 QUICK ACTIONS
  const cards = [
    {
      title: "Book Appointment",
      subtitle:
        "Find available doctors",
      link: "/doctors",
      color: "#2563eb",
    },

    {
      title: "My Appointments",
      subtitle:
        "Manage your bookings",
      link: "/appointments",
      color: "#7c3aed",
    },

    {
      title: "Prescriptions",
      subtitle:
        "View prescriptions",
      link: "/prescriptions",
      color: "#16a34a",
    },

    {
      title: "My Profile",
      subtitle:
        "Update account details",
      link: "/profile",
      color: "#ea580c",
    },
  ];

  // 🔥 LOADING
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            "center",
          alignItems: "center",
          backgroundColor:
            "#f3f4f6",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

        <Text
          style={{
            marginTop: 12,
            color: "#6b7280",
          }}
        >
          Loading dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          "#f3f4f6",
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
      >
        {/* 🔥 HEADER */}
        <View
          style={{
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            Dashboard
          </Text>

          <Text
            style={{
              color: "#6b7280",
              marginTop: 6,
              fontSize: 15,
            }}
          >
            Manage appointments,
            prescriptions & bills
          </Text>
        </View>

        {/* 🔥 STATS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent:
              "space-between",
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Total",
              value: stats.total,
            },

            {
              label: "Upcoming",
              value:
                stats.upcoming,
            },

            {
              label:
                "Prescriptions",
              value:
                stats.prescriptions,
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor:
                  "#fff",

                paddingVertical: 18,

                paddingHorizontal: 12,

                borderRadius: 18,

                width: "31%",

                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                {item.label}
              </Text>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* 🔥 QUICK ACTIONS */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#111827",
            marginBottom: 14,
          }}
        >
          Quick Actions
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent:
              "space-between",

            marginBottom: 20,
          }}
        >
          {cards.map((card, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  card.link as any
                )
              }
              style={{
                backgroundColor:
                  "#fff",

                padding: 18,

                borderRadius: 20,

                width: "48%",

                marginBottom: 14,

                elevation: 3,

                borderTopWidth: 4,

                borderTopColor:
                  card.color,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "#111827",
                }}
              >
                {card.title}
              </Text>

              <Text
                style={{
                  color: "#6b7280",
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                {card.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔥 RECENT ACTIVITY */}
        <View
          style={{
            backgroundColor:
              "#fff",

            padding: 18,

            borderRadius: 20,

            elevation: 3,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 14,
              color: "#111827",
            }}
          >
            Recent Activity
          </Text>

          {activity.length ===
          0 ? (
            <Text
              style={{
                color: "#6b7280",
              }}
            >
              No recent activity
            </Text>
          ) : (
            activity.map((a, i) => (
              <View
                key={i}
                style={{
                  flexDirection:
                    "row",

                  justifyContent:
                    "space-between",

                  borderBottomWidth:
                    i ===
                    activity.length -
                      1
                      ? 0
                      : 1,

                  borderBottomColor:
                    "#f3f4f6",

                  paddingBottom: 12,

                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    paddingRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontWeight:
                        "600",

                      color:
                        "#111827",
                    }}
                  >
                    {a.type ===
                    "appointment"
                      ? `Appointment with Dr. ${a.doctor}`
                      : "Prescription added"}
                  </Text>

                  <Text
                    style={{
                      color:
                        "#6b7280",

                      fontSize: 12,

                      marginTop: 4,
                    }}
                  >
                    {new Date(
                      a.date
                    ).toDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 🔥 FLOATING BUTTON */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          router.push(
            "/doctors" as any
          )
        }
        style={{
          position: "absolute",

          bottom: 24,
          right: 20,

          backgroundColor:
            "#2563eb",

          paddingVertical: 16,

          paddingHorizontal: 22,

          borderRadius: 999,

          elevation: 8,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 15,
          }}
        >
          + Book
        </Text>
      </TouchableOpacity>
    </View>
  );
}