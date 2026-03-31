import { StatusBar } from "expo-status-bar"
import { NavigationContainer, DefaultTheme } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

type RootTabParamList = {
  Dashboard: undefined
  Timetable: undefined
  Faculty: undefined
  Approvals: undefined
  Notifications: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f4f6fb",
    card: "#ffffff",
    primary: "#1d4ed8",
    text: "#0f172a",
    border: "#e5e7eb",
    notification: "#ef4444",
  },
}

function ScreenShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  )
}

function DashboardScreen() {
  return (
    <ScreenShell title="Dashboard" subtitle="Quick visibility into today operations">
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Today</Text>
        <Text style={styles.heroValue}>6 Classes</Text>
        <Text style={styles.heroSub}>Next: Deep Learning, 1:30 PM, AIML-204</Text>
      </View>

      <View style={styles.cardRow}>
        <MetricCard label="Conflicts" value="0" tone="danger" />
        <MetricCard label="Locked Slots" value="4" tone="neutral" />
      </View>

      <Section title="Quick Actions">
        <Action title="Generate Timetable" />
        <Action title="Run Conflict Check" />
        <Action title="Export PDF / Excel" />
      </Section>
    </ScreenShell>
  )
}

function TimetableScreen() {
  const rows = [
    ["9:00 - 9:45", "Distributed Systems", "Deep Learning", "Big Data", "AI Lab", "Networks"],
    ["9:45 - 10:30", "Machine Learning", "Cloud", "Database", "Software Eng", "Design Thinking"],
    ["10:30 - 11:15", "Algorithms", "Operating Systems", "Compiler", "Math", "NLP"],
  ]

  return (
    <ScreenShell title="Timetable" subtitle="Semester 6, Section A">
      <Section title="Weekly Grid">
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Time</Text>
          <Text style={styles.tableHeaderText}>Mon</Text>
          <Text style={styles.tableHeaderText}>Tue</Text>
        </View>
        {rows.map((row) => (
          <View key={row[0]} style={styles.tableRow}>
            <Text style={styles.tableCellTime}>{row[0]}</Text>
            <Text style={styles.tableCell}>{row[1]}</Text>
            <Text style={styles.tableCell}>{row[2]}</Text>
          </View>
        ))}
      </Section>

      <Section title="Controls">
        <Action title="Set Min/Max per Subject" />
        <Action title="Mark Critical Slot Locks" />
        <Action title="Regenerate with Locks" />
      </Section>
    </ScreenShell>
  )
}

function FacultyScreen() {
  return (
    <ScreenShell title="Faculty" subtitle="Workload and availability">
      <Section title="Top Load">
        <ListItem title="Dr. Miller" meta="18 hrs/week" />
        <ListItem title="Prof. Lee" meta="16 hrs/week" />
        <ListItem title="Dr. Kim" meta="15 hrs/week" />
      </Section>

      <Section title="Actions">
        <Action title="Rebalance Workload" />
        <Action title="View Per-Faculty Printable" />
      </Section>
    </ScreenShell>
  )
}

function ApprovalsScreen() {
  return (
    <ScreenShell title="Approvals" subtitle="Pending items requiring action">
      <Section title="Leave Requests">
        <ListItem title="Priya Nair" meta="Apr 2 - Apr 4" />
        <ListItem title="Arun Das" meta="Apr 5" />
      </Section>

      <Section title="Substitutions">
        <ListItem title="DBMS slot substitute" meta="Today, 11:15 AM" />
        <ListItem title="AI Lab reassignment" meta="Tomorrow, 1:30 PM" />
      </Section>
    </ScreenShell>
  )
}

function NotificationsScreen() {
  return (
    <ScreenShell title="Notifications" subtitle="Important updates and alerts">
      <Section title="Recent">
        <ListItem title="No conflict found after latest regeneration" meta="2 min ago" />
        <ListItem title="Saturday configured as half day" meta="15 min ago" />
        <ListItem title="PDF exported successfully" meta="1 hour ago" />
      </Section>
    </ScreenShell>
  )
}

function SettingsScreen() {
  return (
    <ScreenShell title="Settings" subtitle="Institution and timetable preferences">
      <Section title="Academic">
        <ListItem title="Departments" meta="IT, MECH, CIVIL, AIML, AIDS, CSD" />
        <ListItem title="Saturday Mode" meta="Half Day" />
        <ListItem title="Conflict Engine" meta="Enabled" />
      </Section>

      <Section title="Distribution Build">
        <ListItem title="Package" meta="com.orchestra.mobile" />
        <ListItem title="Signing" meta="Release keystore configured" />
      </Section>
    </ScreenShell>
  )
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "danger" | "neutral" }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, tone === "danger" ? styles.metricDanger : styles.metricNeutral]}>{value}</Text>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function ListItem({ title, meta }: { title: string; meta: string }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.listTitle}>{title}</Text>
      <Text style={styles.listMeta}>{meta}</Text>
    </View>
  )
}

function Action({ title }: { title: string }) {
  return (
    <Pressable style={styles.actionButton}>
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#1d4ed8",
            tabBarInactiveTintColor: "#64748b",
            tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
            tabBarStyle: {
              height: 62,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopColor: "#e5e7eb",
              backgroundColor: "#ffffff",
            },
          }}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Timetable" component={TimetableScreen} />
          <Tab.Screen name="Faculty" component={FacultyScreen} />
          <Tab.Screen name="Approvals" component={ApprovalsScreen} />
          <Tab.Screen name="Notifications" component={NotificationsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#475569",
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    padding: 16,
  },
  heroEyebrow: {
    color: "#dbeafe",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  heroValue: {
    marginTop: 6,
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 30,
  },
  heroSub: {
    marginTop: 3,
    color: "#dbeafe",
    fontSize: 13,
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    backgroundColor: "#ffffff",
    padding: 12,
  },
  metricLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
  metricValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
  },
  metricDanger: {
    color: "#dc2626",
  },
  metricNeutral: {
    color: "#111827",
  },
  section: {
    borderRadius: 14,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    backgroundColor: "#ffffff",
    padding: 12,
  },
  sectionTitle: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },
  sectionBody: {
    marginTop: 8,
    gap: 8,
  },
  listItem: {
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  listTitle: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
  listMeta: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
  },
  actionButton: {
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  actionText: {
    color: "#1e3a8a",
    fontWeight: "700",
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableCellTime: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
    fontWeight: "700",
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: "#0f172a",
  },
})
