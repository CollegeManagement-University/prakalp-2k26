import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Orchestra Mobile</Text>
          <Text style={styles.headerTitle}>Timetable Assistant</Text>
          <Text style={styles.headerSubtitle}>Designed for quick daily schedule checks and updates.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.cardPrimary}>
            <Text style={styles.cardTitle}>Today Overview</Text>
            <Text style={styles.cardValue}>6 Classes</Text>
            <Text style={styles.cardMeta}>1:30 PM - Deep Learning, Room AIML-204</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardSmall}>
              <Text style={styles.cardTitle}>Conflicts</Text>
              <Text style={styles.metricCritical}>0</Text>
            </View>
            <View style={styles.cardSmall}>
              <Text style={styles.cardTitle}>Locked Slots</Text>
              <Text style={styles.metricNeutral}>4</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>Open Timetable</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>Run Conflict Check</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>Export PDF / Excel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e8f0",
  },
  headerEyebrow: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  headerTitle: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#475569",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  cardPrimary: {
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    padding: 16,
  },
  cardTitle: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "700",
  },
  cardValue: {
    marginTop: 8,
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "800",
  },
  cardMeta: {
    marginTop: 4,
    color: "#dbeafe",
    fontSize: 13,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  cardSmall: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    padding: 14,
    borderWidth: 1,
    borderColor: "#e6e8f0",
  },
  metricCritical: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "800",
    color: "#dc2626",
  },
  metricNeutral: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "800",
    color: "#1e293b",
  },
  section: {
    marginTop: 2,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e8f0",
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  actionButton: {
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  actionText: {
    color: "#1e3a8a",
    fontWeight: "700",
    fontSize: 14,
  },
})
