import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { API } from "../../services/api";

export default function Profile() {
  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  const [editing,
    setEditing] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      phone: "",
      gender: "",
      dob: "",
      bloodGroup: "",
      address: "",
      emergencyContact: "",
    });

  // 🔥 AGE
  const getAge = (
    dob: string
  ) => {
    if (!dob) return "-";

    const birth =
      new Date(dob);

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const m =
      today.getMonth() -
      birth.getMonth();

    if (
      m < 0 ||
      (m === 0 &&
        today.getDate() <
          birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  // 🔥 LOAD PROFILE
  const load =
    async () => {
      try {
        const res =
          await API.get(
            "/auth/me"
          );

        const user =
          res.data?.user;

        if (user) {
          setForm({
            name:
              user.name ||
              "",

            phone:
              user.phone ||
              "",

            gender:
              user.gender ||
              "",

            dob: user.dob
              ? user.dob.split(
                  "T"
                )[0]
              : "",

            bloodGroup:
              user.bloodGroup ||
              "",

            address:
              user.address ||
              "",

            emergencyContact:
              user.emergencyContact ||
              "",
          });
        }
      } catch (err) {
        console.log(err);

        Alert.alert(
          "Error",
          "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    load();
  }, []);

  // 🔥 SAVE
  const save =
    async () => {
      try {
        setSaving(true);

        await API.put(
          "/profile",
          form
        );

        Alert.alert(
          "Success",
          "Profile updated ✅"
        );

        setEditing(false);

        load();
      } catch (err) {
        console.log(err);

        Alert.alert(
          "Error",
          "Update failed"
        );
      } finally {
        setSaving(false);
      }
    };

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
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          "#f3f4f6",
      }}
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 60,
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
          Patient Profile
        </Text>

        <Text
          style={{
            marginTop: 6,
            color: "#6b7280",
            fontSize: 15,
          }}
        >
          Manage your personal
          details
        </Text>
      </View>

      {/* 🔥 CARD */}
      <View
        style={{
          backgroundColor:
            "#fff",

          padding: 20,

          borderRadius: 24,

          elevation: 3,
        }}
      >
        {/* 🔥 AVATAR */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 999,
              backgroundColor:
                "#2563eb",

              justifyContent:
                "center",

              alignItems:
                "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 32,
                fontWeight:
                  "bold",
              }}
            >
              {form.name
                ? form.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </Text>
          </View>

          <Text
            style={{
              marginTop: 12,
              fontSize: 22,
              fontWeight:
                "bold",
              color: "#111827",
            }}
          >
            {form.name ||
              "Patient"}
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: "#6b7280",
            }}
          >
            Age:{" "}
            {getAge(
              form.dob
            )}
          </Text>
        </View>

        {/* 🔥 FIELDS */}
        {[
          {
            label: "Full Name",
            key: "name",
          },

          {
            label: "Phone",
            key: "phone",
          },

          {
            label: "Gender",
            key: "gender",
          },

          {
            label:
              "Date of Birth",
            key: "dob",
          },

          {
            label:
              "Blood Group",
            key: "bloodGroup",
          },

          {
            label:
              "Emergency Contact",
            key:
              "emergencyContact",
          },

          {
            label: "Address",
            key: "address",
          },
        ].map(
          (field: any) => (
            <View
              key={field.key}
              style={{
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  marginBottom: 8,
                  color:
                    "#6b7280",
                  fontWeight:
                    "600",
                }}
              >
                {field.label}
              </Text>

              <TextInput
                value={
                  (
                    form as any
                  )[
                    field.key
                  ]
                }
                editable={
                  editing
                }
                onChangeText={(
                  t
                ) =>
                  setForm({
                    ...form,

                    [field.key]:
                      t,
                  })
                }
                placeholder={
                  field.label
                }
                placeholderTextColor="#9ca3af"
                multiline={
                  field.key ===
                  "address"
                }
                style={{
                  borderWidth: 1,

                  borderColor:
                    "#e5e7eb",

                  padding: 14,

                  borderRadius: 14,

                  backgroundColor:
                    editing
                      ? "#fff"
                      : "#f9fafb",

                  minHeight:
                    field.key ===
                    "address"
                      ? 90
                      : 55,

                  textAlignVertical:
                    field.key ===
                    "address"
                      ? "top"
                      : "center",
                }}
              />
            </View>
          )
        )}

        {/* 🔥 BUTTONS */}
        {!editing ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setEditing(true)
            }
            style={{
              backgroundColor:
                "#2563eb",

              padding: 16,

              borderRadius: 16,

              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",

                textAlign:
                  "center",

                fontWeight:
                  "bold",

                fontSize: 15,
              }}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection:
                "row",

              gap: 12,

              marginTop: 8,
            }}
          >
            {/* SAVE */}
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              disabled={
                saving
              }
              onPress={save}
              style={{
                flex: 1,

                backgroundColor:
                  "#16a34a",

                padding: 16,

                borderRadius: 16,

                opacity:
                  saving
                    ? 0.7
                    : 1,
              }}
            >
              <Text
                style={{
                  color:
                    "#fff",

                  textAlign:
                    "center",

                  fontWeight:
                    "bold",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              onPress={() => {
                setEditing(
                  false
                );

                load();
              }}
              style={{
                flex: 1,

                backgroundColor:
                  "#9ca3af",

                padding: 16,

                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color:
                    "#fff",

                  textAlign:
                    "center",

                  fontWeight:
                    "bold",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}