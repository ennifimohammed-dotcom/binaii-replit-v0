import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, todayISO } from "@/lib/format";

const PROJECT_COLORS = [
  "#d4a017",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#ef4444",
  "#f97316",
];

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    projects,
    expenses,
    activeProjectId,
    setActiveProject,
    addProject,
    deleteProject,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]!);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Project name is required.");
      return;
    }
    const proj = await addProject({
      name: name.trim(),
      client: client.trim() || undefined,
      location: location.trim() || undefined,
      startDate: todayISO(),
      color,
    });
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setActiveProject(proj.id);
    setName("");
    setClient("");
    setLocation("");
    setShowForm(false);
  };

  const handleSelect = async (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    await setActiveProject(id);
    router.back();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      `Delete "${name}"?`,
      "All expenses and budgets for this project will also be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteProject(id);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Projects
        </Text>

        <View style={{ gap: 10, marginTop: 18 }}>
          {projects.map((p) => {
            const projExpenses = expenses.filter((e) => e.projectId === p.id);
            const total = projExpenses.reduce((s, e) => s + e.amount, 0);
            const isActive = p.id === activeProjectId;
            return (
              <Pressable
                key={p.id}
                onPress={() => handleSelect(p.id)}
                style={({ pressed }) => [
                  styles.projCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isActive ? colors.accent : colors.border,
                    borderWidth: isActive ? 1.5 : StyleSheet.hairlineWidth,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.projDot,
                    { backgroundColor: p.color ?? colors.accent },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.projTopRow}>
                    <Text
                      style={[styles.projName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    {isActive ? (
                      <View
                        style={[
                          styles.activeBadge,
                          { backgroundColor: colors.accent + "26" },
                        ]}
                      >
                        <Feather
                          name="check"
                          size={11}
                          color={colors.accent}
                        />
                        <Text
                          style={[
                            styles.activeBadgeText,
                            { color: colors.accent },
                          ]}
                        >
                          Active
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[styles.projMeta, { color: colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {[p.location, p.client].filter(Boolean).join(" • ") ||
                      "No details"}
                  </Text>
                  <Text
                    style={[
                      styles.projTotal,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {projExpenses.length} expenses •{" "}
                    {formatCurrency(total, { compact: true })}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(p.id, p.name)}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    padding: 6,
                    opacity: pressed ? 0.5 : 0.6,
                  })}
                >
                  <Feather
                    name="trash-2"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        {!showForm ? (
          <Pressable
            onPress={() => setShowForm(true)}
            style={({ pressed }) => [
              styles.newBtn,
              {
                backgroundColor: colors.foreground,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="plus" size={16} color={colors.background} />
            <Text style={[styles.newBtnText, { color: colors.background }]}>
              New project
            </Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              New project
            </Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              NAME
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Casablanca Tower"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                { color: colors.mutedForeground, marginTop: 14 },
              ]}
            >
              CLIENT (OPTIONAL)
            </Text>
            <TextInput
              value={client}
              onChangeText={setClient}
              placeholder="e.g. Atlas Holdings"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                { color: colors.mutedForeground, marginTop: 14 },
              ]}
            >
              LOCATION (OPTIONAL)
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Casablanca, Morocco"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                { color: colors.mutedForeground, marginTop: 14 },
              ]}
            >
              COLOR
            </Text>
            <View style={styles.colorRow}>
              {PROJECT_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={({ pressed }) => [
                    styles.colorBtn,
                    {
                      backgroundColor: c,
                      borderColor:
                        color === c ? colors.foreground : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {color === c ? (
                    <Feather name="check" size={14} color="#fff" />
                  ) : null}
                </Pressable>
              ))}
            </View>
            <View style={styles.formBtnRow}>
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setName("");
                  setClient("");
                  setLocation("");
                }}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  {
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    { color: colors.foreground },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleAdd}
                style={({ pressed }) => [
                  styles.saveBtn,
                  {
                    backgroundColor: colors.foreground,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: colors.background },
                  ]}
                >
                  Create project
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kicker: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  projCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  projDot: {
    width: 10,
    height: 36,
    borderRadius: 5,
  },
  projTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  projName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 10.5,
    fontFamily: "Inter_700Bold",
  },
  projMeta: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  projTotal: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 14,
  },
  newBtnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  formCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
  },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  formBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
