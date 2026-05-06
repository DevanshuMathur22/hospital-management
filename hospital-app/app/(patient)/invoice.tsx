import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useEffect, useState } from "react";

import { API } from "../../services/api";

export default function Invoice() {
  const { id } =
    useLocalSearchParams();

  const [invoice, setInvoice] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [paymentLoading,
    setPaymentLoading] =
    useState(false);

  const [payAmount,
    setPayAmount] =
    useState("");

  const [paymentMode,
    setPaymentMode] =
    useState("UPI");

  // 🔥 LOAD INVOICE
  useEffect(() => {
    if (!id) return;

    API.get(`/bills/${id}`)
      .then((res) => {
        setInvoice(res.data);

        const remaining =
          Number(
            res.data.totalAmount || 0
          ) -
          Number(
            res.data.paidAmount || 0
          );

        setPayAmount(
          String(remaining)
        );
      })
      .catch((err) => {
        console.log(err);

        setInvoice(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 🔥 PAYMENT
  const handlePayment =
    async () => {
      if (
        !payAmount ||
        Number(payAmount) <= 0
      ) {
        Alert.alert(
          "Error",
          "Enter valid amount"
        );

        return;
      }

      try {
        setPaymentLoading(true);

        const res =
          await API.post(
            "/bills/pay",
            {
              billId: id,

              amount:
                Number(
                  payAmount
                ),

              paymentMode,
            }
          );

        setInvoice(
          res.data.bill
        );

        Alert.alert(
          "Success",
          "Payment Successful ✅"
        );
      } catch (err) {
        console.log(err);

        Alert.alert(
          "Error",
          "Payment failed"
        );
      } finally {
        setPaymentLoading(
          false
        );
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
          Loading invoice...
        </Text>
      </View>
    );
  }

  // 🔥 NOT FOUND
  if (!invoice) {
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
        <Text
          style={{
            fontSize: 18,
            color: "#6b7280",
          }}
        >
          Invoice not found
        </Text>
      </View>
    );
  }

  const total = Number(
    invoice.totalAmount || 0
  );

  const paid = Number(
    invoice.paidAmount || 0
  );

  const remaining =
    total - paid;

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
            fontSize: 28,
            fontWeight: "bold",
            color: "#111827",
          }}
        >
          Hospital Invoice
        </Text>

        <Text
          style={{
            color: "#6b7280",
            marginTop: 4,
          }}
        >
          Invoice ID:{" "}
          {invoice._id ||
            invoice.id}
        </Text>
      </View>

      {/* 🔥 PATIENT */}
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
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 8,
            color: "#111827",
          }}
        >
          Patient Details
        </Text>

        <Text
          style={{
            color: "#374151",
          }}
        >
          {
            invoice.patient
              ?.name
          }
        </Text>

        <Text
          style={{
            color: "#6b7280",
            marginTop: 4,
          }}
        >
          {
            invoice.patient
              ?.phone
          }
        </Text>
      </View>

      {/* 🔥 DOCTOR */}
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
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 8,
            color: "#111827",
          }}
        >
          Doctor
        </Text>

        <Text
          style={{
            color: "#374151",
          }}
        >
          Dr.{" "}
          {
            invoice.doctor
              ?.name
          }
        </Text>
      </View>

      {/* 🔥 BILL DETAILS */}
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
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 12,
            color: "#111827",
          }}
        >
          Bill Details
        </Text>

        <View
          style={{
            flexDirection:
              "row",

            justifyContent:
              "space-between",

            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#6b7280",
            }}
          >
            Title
          </Text>

          <Text
            style={{
              fontWeight: "600",
            }}
          >
            {invoice.title}
          </Text>
        </View>

        <View
          style={{
            flexDirection:
              "row",

            justifyContent:
              "space-between",

            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#6b7280",
            }}
          >
            Total Amount
          </Text>

          <Text
            style={{
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            ₹{total}
          </Text>
        </View>

        <View
          style={{
            flexDirection:
              "row",

            justifyContent:
              "space-between",

            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#6b7280",
            }}
          >
            Paid
          </Text>

          <Text
            style={{
              fontWeight: "bold",
              color: "#16a34a",
            }}
          >
            ₹{paid}
          </Text>
        </View>

        <View
          style={{
            flexDirection:
              "row",

            justifyContent:
              "space-between",
          }}
        >
          <Text
            style={{
              color: "#6b7280",
            }}
          >
            Remaining
          </Text>

          <Text
            style={{
              fontWeight: "bold",
              color: "#dc2626",
            }}
          >
            ₹{remaining}
          </Text>
        </View>
      </View>

      {/* 🔥 STATUS */}
      <View
        style={{
          backgroundColor:
            "#fff",

          padding: 18,

          borderRadius: 20,

          marginBottom: 18,

          elevation: 3,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 10,
            color: "#111827",
          }}
        >
          Payment Status
        </Text>

        <View
          style={{
            alignSelf:
              "flex-start",

            paddingHorizontal: 14,

            paddingVertical: 6,

            borderRadius: 999,

            backgroundColor:
              invoice.status ===
              "paid"
                ? "#dcfce7"
                : invoice.status ===
                  "partial"
                ? "#dbeafe"
                : "#fef3c7",
          }}
        >
          <Text
            style={{
              fontWeight: "600",

              color:
                invoice.status ===
                "paid"
                  ? "#16a34a"
                  : invoice.status ===
                    "partial"
                  ? "#2563eb"
                  : "#ca8a04",
            }}
          >
            {invoice.status}
          </Text>
        </View>
      </View>

      {/* 🔥 PAYMENT SECTION */}
      {invoice.status !==
        "paid" && (
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
            Make Payment
          </Text>

          {/* 🔥 MODES */}
          <View
            style={{
              flexDirection:
                "row",

              gap: 10,

              marginBottom: 16,
            }}
          >
            {[
              "UPI",
              "CARD",
              "CASH",
            ].map((mode) => {
              const active =
                paymentMode ===
                mode;

              return (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    setPaymentMode(
                      mode
                    )
                  }
                  style={{
                    flex: 1,

                    padding: 12,

                    borderRadius: 12,

                    backgroundColor:
                      active
                        ? "#2563eb"
                        : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      textAlign:
                        "center",

                      fontWeight:
                        "600",

                      color:
                        active
                          ? "#fff"
                          : "#111827",
                    }}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 🔥 INPUT */}
          <TextInput
            value={payAmount}
            onChangeText={
              setPayAmount
            }
            placeholder="Enter amount"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            style={{
              borderWidth: 1,

              borderColor:
                "#e5e7eb",

              padding: 14,

              borderRadius: 14,

              marginBottom: 16,

              backgroundColor:
                "#f9fafb",
            }}
          />

          {/* 🔥 BUTTON */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={
              paymentLoading
            }
            onPress={
              handlePayment
            }
            style={{
              backgroundColor:
                "#16a34a",

              padding: 16,

              borderRadius: 14,

              opacity:
                paymentLoading
                  ? 0.7
                  : 1,
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
              {paymentLoading
                ? "Processing..."
                : "Pay Now"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}