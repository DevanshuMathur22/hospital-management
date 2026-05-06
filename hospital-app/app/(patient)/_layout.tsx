// app/(patient)/_layout.tsx

import { Tabs } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          "#2563eb",

        tabBarInactiveTintColor:
          "#9ca3af",

        tabBarStyle: {
          backgroundColor:
            "#ffffff",

          height: 72,

          paddingBottom: 10,

          paddingTop: 10,

          borderTopWidth: 0,

          elevation: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,

          fontWeight: "600",

          marginTop: 2,
        },

        tabBarItemStyle: {
          borderRadius: 14,

          marginHorizontal: 4,
        },

        tabBarIcon: ({
          color,
          focused,
        }) => {
          let iconName: any;

          if (
            route.name ===
            "dashboard"
          )
            iconName = focused
              ? "home"
              : "home-outline";

          else if (
            route.name ===
            "doctors"
          )
            iconName = focused
              ? "medkit"
              : "medkit-outline";

          else if (
            route.name ===
            "appointments"
          )
            iconName = focused
              ? "calendar"
              : "calendar-outline";

          else if (
            route.name ===
            "bills"
          )
            iconName = focused
              ? "receipt"
              : "receipt-outline";

          else if (
            route.name ===
            "profile"
          )
            iconName = focused
              ? "person"
              : "person-outline";

          else
            iconName =
              "ellipse-outline";

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      {/* HOME */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
        }}
      />

      {/* DOCTORS */}
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
        }}
      />

      {/* APPOINTMENTS */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
        }}
      />

      {/* BILLS */}
      <Tabs.Screen
        name="bills"
        options={{
          title: "Bills",
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />

      {/* HIDE EXTRA ROUTES */}
      <Tabs.Screen
        name="appointment-history"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="invoice"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="prescriptions"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}