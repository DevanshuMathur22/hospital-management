import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";

import { API } from "../../services/api";

export default function Prescriptions() {
  const [prescriptions,
    setPrescriptions] =
    useState<any[]>([]);

  const [filtered,
    setFiltered] =
    useState<any[]>([]);

  const [loading,
    setLoading] =
    useState(true);

  const [selected,
    setSelected] =
    useState<any>(null);

  const [search,
    setSearch] =
    useState("");

  // 🔥 FETCH
  useEffect(() => {
    API.get("/prescriptions")
      .then((res) => {
        const data =
          Array.isArray(
            res.data
          )
            ? res.data
            : [];

        setPrescriptions(
          data
        );

        setFiltered(data);
      })
      .catch((err) => {
        console.log(err);

        setPrescriptions(
          []
        );

        setFiltered([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔥 SEARCH
  useEffect(() => {
    const s =
      search.toLowerCase();

    const f =
      prescriptions.filter(
        (p: any) => {
          const doctor =
            p.doctor?.name?.toLowerCase() ||
            "";

          const patient =
            p.patient?.name?.toLowerCase() ||
            "";

          return (
            doctor.includes(
              s
            ) ||
            patient.includes(
              s
            )
          );
        }
      );

    setFiltered(f);
  }, [search, prescriptions]);

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
          Loading prescriptions...
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
        padding: 16,
      }}
    >
      {/* 🔥 TITLE */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#111827",
          marginBottom: 18,
        }}
      >
        My Prescriptions
      </Text>

      {/* 🔥 SEARCH */}
      <TextInput
        placeholder="Search doctor..."
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={
          setSearch
        }
        style={{
          borderWidth: 1,
          borderColor:
            "#e5e7eb",
          padding: 14,
          borderRadius: 14,
          marginBottom: 16,
          backgroundColor:
            "#fff",
        }}
      />

      {/* 🔥 EMPTY */}
      {filtered.length ===
        0 && (
        <View
          style={{
            marginTop: 40,
            alignItems:
              "center",
          }}
        >
          <Text
            style={{
              color:
                "#6b7280",
              fontSize: 15,
            }}
          >
            No prescriptions found
          </Text>
        </View>
      )}

      {/* 🔥 LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(
          item,
          index
        ) =>
          item._id ||
          item.id ||
          index.toString()
        }
        showsVerticalScrollIndicator={
          false
        }
        renderItem={({
          item,
        }) => (
          <View
            style={{
              backgroundColor:
                "#fff",

              padding: 18,

              borderRadius: 20,

              marginBottom: 14,

              elevation: 3,
            }}
          >
            {/* 🔥 DOCTOR */}
            <Text
              style={{
                fontSize: 18,
                fontWeight:
                  "bold",
                color:
                  "#111827",
              }}
            >
              Dr.{" "}
              {
                item.doctor
                  ?.name
              }
            </Text>

            {/* 🔥 DATE */}
            <Text
              style={{
                color:
                  "#6b7280",

                marginTop: 6,

                marginBottom: 10,
              }}
            >
              {item.createdAt
                ? new Date(
                    item.createdAt
                  ).toDateString()
                : "No Date"}
            </Text>

            {/* 🔥 MEDICINES PREVIEW */}
            {item.medicine
              ?.slice(0, 2)
              .map(
                (
                  m: any,
                  i: number
                ) => (
                  <Text
                    key={i}
                    style={{
                      color:
                        "#374151",

                      marginBottom: 4,
                    }}
                  >
                    •{" "}
                    {
                      m.name
                    }{" "}
                    -{" "}
                    {
                      m.dosage
                    }
                  </Text>
                )
              )}

            {/* 🔥 BUTTON */}
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              onPress={() =>
                setSelected(
                  item
                )
              }
              style={{
                backgroundColor:
                  "#2563eb",

                padding: 12,

                borderRadius: 12,

                marginTop: 14,
              }}
            >
              <Text
                style={{
                  color:
                    "#fff",

                  textAlign:
                    "center",

                  fontWeight:
                    "600",
                }}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* 🔥 MODAL */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,

            justifyContent:
              "center",

            backgroundColor:
              "rgba(0,0,0,0.4)",

            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor:
                "#fff",

              borderRadius: 24,

              padding: 20,

              maxHeight: "85%",
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {/* 🔥 TITLE */}
              <Text
                style={{
                  fontSize: 22,

                  fontWeight:
                    "bold",

                  marginBottom: 16,

                  color:
                    "#111827",
                }}
              >
                Prescription Details
              </Text>

              {/* 🔥 PATIENT */}
              <View
                style={{
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight:
                      "600",

                    color:
                      "#6b7280",
                  }}
                >
                  Patient
                </Text>

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                  }}
                >
                  {
                    selected
                      ?.patient
                      ?.name
                  }
                </Text>
              </View>

              {/* 🔥 DOCTOR */}
              <View
                style={{
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight:
                      "600",

                    color:
                      "#6b7280",
                  }}
                >
                  Doctor
                </Text>

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                  }}
                >
                  Dr.{" "}
                  {
                    selected
                      ?.doctor
                      ?.name
                  }
                </Text>
              </View>

              {/* 🔥 DATE */}
              <View
                style={{
                  marginBottom: 18,
                }}
              >
                <Text
                  style={{
                    fontWeight:
                      "600",

                    color:
                      "#6b7280",
                  }}
                >
                  Date
                </Text>

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                  }}
                >
                  {selected?.createdAt
                    ? new Date(
                        selected.createdAt
                      ).toDateString()
                    : ""}
                </Text>
              </View>

              {/* 🔥 MEDICINES */}
              <Text
                style={{
                  fontSize: 18,

                  fontWeight:
                    "bold",

                  marginBottom: 14,

                  color:
                    "#111827",
                }}
              >
                Medicines
              </Text>

              {selected?.medicine?.map(
                (
                  m: any,
                  i: number
                ) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor:
                        "#f9fafb",

                      padding: 14,

                      borderRadius: 16,

                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight:
                          "bold",

                        fontSize: 16,

                        marginBottom: 8,

                        color:
                          "#111827",
                      }}
                    >
                      {i + 1}.{" "}
                      {m.name}
                    </Text>

                    <Text
                      style={{
                        color:
                          "#374151",

                        marginBottom: 4,
                      }}
                    >
                      Dosage:{" "}
                      {
                        m.dosage
                      }
                    </Text>

                    <Text
                      style={{
                        color:
                          "#374151",

                        marginBottom: 4,
                      }}
                    >
                      Days:{" "}
                      {m.days ||
                        "-"}
                    </Text>

                    <Text
                      style={{
                        color:
                          "#374151",
                      }}
                    >
                      Note:{" "}
                      {m.note ||
                        "-"}
                    </Text>
                  </View>
                )
              )}

              {/* 🔥 CLOSE */}
              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onPress={() =>
                  setSelected(
                    null
                  )
                }
                style={{
                  backgroundColor:
                    "#2563eb",

                  padding: 15,

                  borderRadius: 14,

                  marginTop: 10,
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
                  Close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}