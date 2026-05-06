// app/(patient)/appointments.tsx

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

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("");
  const [availability, setAvailability] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= SLOT GENERATOR ================= */
  const generateTimeSlots = (start: string, end: string) => {
    if (!start || !end) return [];

    const slots: any[] = [];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;

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

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/appointments");
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setAppointments([]);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= OPEN RESCHEDULE ================= */
  const openReschedule = async (a: any) => {
    setSelected(a);
    setNewDate(new Date(a.date));
    setNewTime(a.time);

    try {
      const res = await API.get(`/doctors/availability?doctorId=${a.doctorId}`);
      setAvailability(res.data);
    } catch (err) {
      console.log(err);
      setAvailability(null);
    }
  };

  /* ================= TIME SLOTS ================= */
  const timeSlots = useMemo(() => {
    if (!availability?.start || !availability?.end) return [];
    return generateTimeSlots(availability.start, availability.end);
  }, [availability]);

  /* ================= CHECK BOOKED SLOT ================= */
  const isSlotBooked = (date: Date, time: string) => {
    return appointments.some((a: any) => {
      const appointmentDate = new Date(a.date);
      return (
        appointmentDate.toDateString() === date.toDateString() &&
        a.time === time &&
        a.id !== selected?.id
      );
    });
  };

  /* ================= CHECK DOCTOR AVAILABLE ON DAY ================= */
  const isDoctorAvailable = (date: Date) => {
    if (!availability?.days) return true;
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    return availability.days.includes(day);
  };

  /* ================= SAVE RESCHEDULE ================= */
  const saveReschedule = async () => {
    if (!selected || !newDate || !newTime) {
      Alert.alert("Error", "Please select date and time");
      return;
    }

    try {
      setSaving(true);
      await API.put(`/appointments/${selected.id}`, {
        date: newDate.toISOString(),
        time: newTime,
      });

      Alert.alert("Success", "Appointment rescheduled successfully ✅");
      setSelected(null);
      setNewDate(null);
      setNewTime("");
      await loadData();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || "Failed to reschedule");
    } finally {
      setSaving(false);
    }
  };

  /* ================= CANCEL APPOINTMENT ================= */
  const cancelAppointment = async (id: string) => {
    try {
      await API.delete(`/appointments/${id}`);
      Alert.alert("Success", "Appointment cancelled");
      await loadData();
    } catch {
      Alert.alert("Error", "Failed to cancel appointment");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6", padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827", marginBottom: 20 }}>
        Appointments
      </Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "#6b7280", marginTop: 50, fontSize: 16 }}>
            No appointments found
          </Text>
        )}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.status === "cancelled" ? "#fef2f2" : "#fff",
              borderWidth: item.status === "cancelled" ? 1 : 0,
              borderColor: "#fecaca",
              padding: 20,
              borderRadius: 20,
              marginBottom: 16,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#1f2937" }}>
              Dr. {item.doctor?.name || "-"}
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
              Patient: {item.patient?.name || "-"}
            </Text>

            <Text style={{ fontSize: 15, color: "#6b7280", marginTop: 8 }}>
              {new Date(item.date).toDateString()}
            </Text>
            <Text style={{ fontSize: 15, color: "#6b7280" }}>Time: {item.time}</Text>

            <View
              style={{
                alignSelf: "flex-start",
                marginTop: 12,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor:
                  item.status === "cancelled"
                    ? "#fee2e2"
                    : item.status === "completed"
                    ? "#dcfce7"
                    : "#fef3c7",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 13,
                  color:
                    item.status === "cancelled"
                      ? "#dc2626"
                      : item.status === "completed"
                      ? "#16a34a"
                      : "#ca8a04",
                }}
              >
                {item.status === "cancelled"
                  ? "❌ Cancelled"
                  : item.status === "completed"
                  ? "✔ Completed"
                  : "⏳ Pending"}
              </Text>
            </View>

            {item.status === "pending" && (
              <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => openReschedule(item)}
                  style={{
                    flex: 1,
                    backgroundColor: "#2563eb",
                    paddingVertical: 14,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                    Reschedule
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => cancelAppointment(item.id)}
                  style={{
                    flex: 1,
                    backgroundColor: "#dc2626",
                    paddingVertical: 14,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Reschedule Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 24, maxHeight: "85%" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>Reschedule Appointment</Text>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={{ fontSize: 28, color: "#9ca3af" }}>✕</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {newDate ? newDate.toDateString() : "Select Date"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newDate || new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate && isDoctorAvailable(selectedDate)) {
                      setNewDate(selectedDate);
                    } else if (selectedDate) {
                      Alert.alert("Not Available", "Doctor is not available on this day.");
                    }
                  }}
                />
              )}

              <Text style={{ fontWeight: "600", marginBottom: 12, fontSize: 16 }}>Available Slots</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {timeSlots.map((slot: any) => {
                  const booked = newDate ? isSlotBooked(newDate, slot.value) : false;
                  const isSelected = newTime === slot.value;

                  return (
                    <TouchableOpacity
                      key={slot.value}
                      disabled={booked}
                      onPress={() => setNewTime(slot.value)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: booked ? "#fca5a5" : isSelected ? "#2563eb" : "#d1d5db",
                        backgroundColor: booked ? "#fee2e2" : isSelected ? "#2563eb" : "#fff",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "500",
                          color: booked ? "#ef4444" : isSelected ? "#fff" : "#374151",
                        }}
                      >
                        {booked ? "❌ Booked" : slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={saveReschedule}
                disabled={saving || !newTime}
                style={{
                  marginTop: 30,
                  backgroundColor: !newTime ? "#9ca3af" : "#2563eb",
                  paddingVertical: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#e5e7eb",
                  paddingVertical: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ textAlign: "center", fontWeight: "600", color: "#4b5563" }}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}