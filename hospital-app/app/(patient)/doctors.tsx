// app/(patient)/doctors.tsx

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";

import { useEffect, useMemo, useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { API } from "../../services/api";

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [groupedDoctors, setGroupedDoctors] = useState<any>({});
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any>(null);

  const [filter, setFilter] = useState("all");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"UPI" | "CASH">("UPI");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  /* ================= SLOT GENERATOR ================= */
  const generateSlots = (start: string, end: string) => {
    if (!start || !end) return [];

    const slots: any[] = [];
    let startMin = +start.split(":")[0] * 60 + +start.split(":")[1];
    let endMin = +end.split(":")[0] * 60 + +end.split(":")[1];

    for (let i = startMin; i < endMin; i += 15) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      const label = new Date(`1970-01-01T${value}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      slots.push({ value, label });
    }
    return slots;
  };

  /* ================= FETCH DOCTORS ================= */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await API.get("/doctors");
        const data = Array.isArray(res.data) ? res.data : [];

        setDoctors(data);

        const grouped = data.reduce((acc: any, doc: any) => {
          const spec = doc.specialization || "Others";
          if (!acc[spec]) acc[spec] = [];
          acc[spec].push(doc);
          return acc;
        }, {});

        setGroupedDoctors(grouped);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  /* ================= RESET ON DOCTOR CHANGE ================= */
  useEffect(() => {
    setDate(null);
    setTime("");
    setBookedSlots([]);
  }, [selectedDoctor]);

  /* ================= FETCH AVAILABILITY ================= */
  useEffect(() => {
    if (!selectedDoctor?.id) return;

    API.get(`/doctors/availability?doctorId=${selectedDoctor.id}`)
      .then((res) => setAvailability(res.data))
      .catch((err) => console.log(err));
  }, [selectedDoctor]);

  /* ================= SET DEFAULT DATE ================= */
  useEffect(() => {
    if (!availability?.days || !selectedDoctor) return;

    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

    if (availability.days.includes(dayName)) {
      setDate(today);
    }
  }, [availability]);

  /* ================= FETCH BOOKED SLOTS ================= */
  useEffect(() => {
    if (!selectedDoctor?.id || !date) return;

    API.get(
      `/appointments/slots?doctorId=${selectedDoctor.id}&date=${date.toISOString()}`
    )
      .then((res) => setBookedSlots(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBookedSlots([]));
  }, [selectedDoctor, date]);

  const timeSlots = availability
    ? generateSlots(availability.start, availability.end)
    : [];

  const isSlotBooked = (slot: string) => {
    return bookedSlots.some((a: any) => a.time === slot);
  };

  /* ================= OPEN BOOKING ================= */
  const openBooking = (doc: any) => {
    setSelectedDoctor(doc);
    setShowBookingModal(true);
  };

  /* ================= CONFIRM SLOT ================= */
  const handleConfirm = async () => {
    if (!time || !date) {
      Alert.alert("Error", "Please select date and time");
      return;
    }

    try {
      setBookingLoading(true);
      const res = await API.post("/appointments/check", {
        doctorId: selectedDoctor.id,
        date: date.toISOString(),
      });

      if (res.status === 200) {
        setShowBookingModal(false);
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Slot not available");
    } finally {
      setBookingLoading(false);
    }
  };

  /* ================= FINAL BOOKING ================= */
  const finalBooking = async () => {
    try {
      const res = await API.post("/appointments", {
        doctorId: selectedDoctor.id,
        date: date?.toISOString(),
        time,
        paymentMode,
        amount: 500,
      });

      const data = res.data;

      if (paymentMode === "UPI") {
        Alert.alert("Processing", "Processing UPI Payment...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      Alert.alert("Success", "Appointment booked successfully!");

      setShowPaymentModal(false);
      setSelectedDoctor(null);
      setDate(null);
      setTime("");

      // Navigate to invoice (You can replace with your navigation)
      // navigation.navigate('Invoice', { billId: data.billId });
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Booking failed");
    }
  };

  const specializations = ["all", ...Object.keys(groupedDoctors)];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
   <ScrollView
  style={{
    flex: 1,
    backgroundColor: "#f3f4f6",
  }}
  contentContainerStyle={{
    padding: 16,
    paddingBottom: 120,
  }}
  showsVerticalScrollIndicator={false}
>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>Find Doctors</Text>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {specializations.map((sp) => (
          <TouchableOpacity
            key={sp}
            onPress={() => setFilter(sp)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              marginRight: 8,
              backgroundColor: filter === sp ? "#2563eb" : "#fff",
              borderWidth: 1,
              borderColor: filter === sp ? "#2563eb" : "#e5e7eb",
            }}
          >
            <Text style={{ color: filter === sp ? "#fff" : "#374151", fontWeight: "500" }}>
              {sp === "all" ? "All" : sp}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Doctors List */}
      {Object.entries(groupedDoctors)
        .filter(([category]) => filter === "all" || filter === category)
        .map(([category, docs]: any) => (
          <View key={category} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
              🏥 {category}
            </Text>

            <FlatList
              data={docs}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 12,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ color: "#6b7280", marginTop: 4 }}>
                    {item.experience} years experience
                  </Text>

                  <TouchableOpacity
                    onPress={() => openBooking(item)}
                    style={{
                      marginTop: 12,
                      backgroundColor: "#2563eb",
                      padding: 12,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                      Book Appointment
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ))}

      {/* ================= BOOKING MODAL ================= */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, maxHeight: "85%" }}>
            <ScrollView>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontSize: 22, fontWeight: "bold" }}>Book Appointment</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Text style={{ fontSize: 26, color: "#9ca3af" }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontWeight: "600", marginBottom: 8 }}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <Text>{date ? date.toDateString() : "Choose Date"}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <Text style={{ fontWeight: "600", marginBottom: 10 }}>Available Slots</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {timeSlots.map((slot: any) => {
                  const booked = isSlotBooked(slot.value);
                  const selected = time === slot.value;

                  return (
                    <TouchableOpacity
                      key={slot.value}
                      disabled={booked}
                      onPress={() => setTime(slot.value)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: booked ? "#fca5a5" : selected ? "#2563eb" : "#d1d5db",
                        backgroundColor: booked ? "#fee2e2" : selected ? "#2563eb" : "#fff",
                      }}
                    >
                      <Text
                        style={{
                          color: booked ? "#ef4444" : selected ? "#fff" : "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {booked ? "Full" : slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!time || bookingLoading}
                style={{
                  marginTop: 24,
                  backgroundColor: !time ? "#9ca3af" : "#2563eb",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                  {bookingLoading ? "Checking..." : "Continue to Payment"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= PAYMENT MODAL ================= */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>Payment</Text>
            <Text style={{ fontSize: 16, marginBottom: 16 }}>Doctor Fee: ₹500</Text>

            <Text style={{ marginBottom: 8, fontWeight: "500" }}>Payment Mode</Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setPaymentMode("UPI")}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: paymentMode === "UPI" ? "#2563eb" : "#e5e7eb",
                }}
              >
                <Text style={{ textAlign: "center", fontWeight: "600" }}>UPI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentMode("CASH")}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: paymentMode === "CASH" ? "#2563eb" : "#e5e7eb",
                }}
              >
                <Text style={{ textAlign: "center", fontWeight: "600" }}>Cash</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={finalBooking}
              style={{
                backgroundColor: "#16a34a",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                Pay & Confirm Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              style={{
                padding: 16,
                backgroundColor: "#e5e7eb",
                borderRadius: 12,
              }}
            >
              <Text style={{ textAlign: "center", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}