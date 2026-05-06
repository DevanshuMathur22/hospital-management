// app/(patient)/bills.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from "react-native";

import { useEffect, useState } from "react";
import { API } from "../../services/api";

export default function PatientBills() {
  const [bills, setBills] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  // For Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // 🔥 FETCH BILLS
  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/patient/bills");
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("BILL FETCH ERROR:", err);
      setBills([]);
      Alert.alert("Error", "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // 🔥 FILTERED BILLS
  const filteredBills = bills.filter((b) => {
    const name = (b.title || "bill").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || b.type === filter;
    return matchSearch && matchFilter;
  });

  // 🔥 OPEN INVOICE MODAL
  const openInvoice = (bill: any) => {
    setSelectedBill(bill);
    setShowInvoiceModal(true);
  };

  // 🔥 PAY BILL
  const payBill = async (billId: string) => {
    try {
      setPayingId(billId);
      const res = await API.post(`/patient/bills/${billId}/pay`, {
        paymentMode: "UPI",
      });

      if (res.status === 200) {
        Alert.alert("Success", "Payment Successful! ✅");
        await fetchBills();
        setShowInvoiceModal(false);
      }
    } catch (err: any) {
      Alert.alert(
        "Payment Failed",
        err?.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading bills...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6", padding: 16 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1e40af", marginBottom: 16 }}>
        My Bills
      </Text>

      {/* SEARCH + FILTER */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <TextInput
          placeholder="Search bills..."
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            fontSize: 16,
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["ALL", "DOCTOR", "LAB", "PHARMACY", "ADMISSION"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: filter === type ? "#2563eb" : "#fff",
                marginRight: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: filter === type ? "#2563eb" : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  color: filter === type ? "#fff" : "#374151",
                  fontWeight: "500",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* BILLS LIST */}
      <FlatList
        data={filteredBills}
        keyExtractor={(item) => item.id?.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "#6b7280", marginTop: 50, fontSize: 16 }}>
            No bills found
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openInvoice(item)}
            style={{
              backgroundColor: "#fff",
              padding: 18,
              borderRadius: 16,
              marginBottom: 14,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Left */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: "600" }}>
                  {item.title || "Hospital Bill"}
                </Text>
                <Text style={{ color: "#6b7280", marginTop: 4 }}>
                  {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Right */}
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#2563eb" }}>
                  ₹{item.totalAmount}
                </Text>

                <View
                  style={{
                    marginTop: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor:
                      item.status === "paid"
                        ? "#dcfce7"
                        : item.status === "partial"
                        ? "#dbeafe"
                        : "#fef3c7",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        item.status === "paid"
                          ? "#166534"
                          : item.status === "partial"
                          ? "#1e40af"
                          : "#ca8a04",
                    }}
                  >
                    {item.status?.toUpperCase()}
                  </Text>
                </View>

                {item.status === "pending" && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      payBill(item.id);
                    }}
                    disabled={payingId === item.id}
                    style={{
                      marginTop: 10,
                      backgroundColor: payingId === item.id ? "#9ca3af" : "#16a34a",
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {payingId === item.id ? "Processing..." : "Pay Now"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ================= INVOICE MODAL ================= */}
      <Modal
        visible={showInvoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInvoiceModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>Invoice</Text>

            {selectedBill && (
              <>
                <Text style={{ fontSize: 16, color: "#6b7280", marginBottom: 12 }}>
                  #{selectedBill.id}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  {selectedBill.title || "Hospital Bill"}
                </Text>
                <Text style={{ color: "#6b7280", marginTop: 4 }}>
                  {selectedBill.type} • {new Date(selectedBill.createdAt).toLocaleDateString()}
                </Text>

                <View style={{ marginVertical: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#e5e7eb" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 16 }}>Total Amount</Text>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: "#2563eb" }}>
                      ₹{selectedBill.totalAmount}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => setShowInvoiceModal(false)}
              style={{
                backgroundColor: "#2563eb",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}