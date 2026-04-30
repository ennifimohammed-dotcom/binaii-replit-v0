import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
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

import BudgetBar from "@/components/BudgetBar";
import Empty from "@/components/Empty";
import { CATEGORIES, CATEGORY_MAP, CategoryId } from "@/constants/categories";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";

export default function BudgetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    activeProject,
    projectExpenses,
    projectBudgets,
    setGlobalBudget,
    setCategoryBudget,
  } = useApp();

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthExpenses = useMemo(
    () => projectExpenses.filter((e) => e.date.slice(0, 7) === monthKey),
    [projectExpenses, monthKey],
  );
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const globalBudget = projectBudgets.find((b) => b.scope === "global");
  const [globalInput, setGlobalInput] = useState(
    globalBudget ? String(globalBudget.amount) : "",
  );

  const categorySpend = useMemo(() => {
    const map: Partial<Record<CategoryId, number>> = {};
    for (const e of monthExpenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return map;
  }, [monthExpenses]);

  const [editingCat, setEditingCat] = useState<CategoryId | null>(null);
  const [catInput, setCatInput] = useState("");

  const handleSaveGlobal = async () => {
    const value = parseFloat(globalInput.replace(",", "."));
    if (Number.isNaN(value) || value < 0) {
      Alert.alert("Invalid amount", "Enter a valid budget.");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setGlobalBudget(value);
  };

  const handleSaveCategory = async (cat: CategoryId) => {
    const value = parseFloat(catInput.replace(",", "."));
    if (Number.isNaN(value) || value < 0) {
      Alert.alert("Invalid amount", "Enter a valid budget or 0 to remove.");
      return;
    }
    await setCategoryBudget(cat, value);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditingCat(null);
    setCatInput("");
  };

  if (!activeProject) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Empty
          icon="briefcase"
          title="No active project"
          detail="Create a project to set budgets."
        />
      </View>
    );
  }

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
          {activeProject.name} • {monthLabel.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Budgets
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Set monthly limits to keep your project on track.
        </Text>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.foreground },
          ]}
        >
          <Text
            style={[
              styles.summaryLabel,
              { color: colors.background + "AA" },
            ]}
          >
            SPENT THIS MONTH
          </Text>
          <Text style={[styles.summaryValue, { color: colors.background }]}>
            {formatCurrency(monthTotal)}
          </Text>
          {globalBudget ? (
            <Text
              style={[
                styles.summarySub,
                { color: colors.background + "99" },
              ]}
            >
              {formatCurrency(globalBudget.amount, { compact: true })} budget •{" "}
              {Math.round((monthTotal / globalBudget.amount) * 100)}% used
            </Text>
          ) : (
            <Text
              style={[
                styles.summarySub,
                { color: colors.background + "99" },
              ]}
            >
              No global budget set
            </Text>
          )}
        </View>

        <Text style={[styles.section, { color: colors.foreground }]}>
          Overall monthly limit
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              value={globalInput}
              onChangeText={setGlobalInput}
              placeholder="e.g. 100000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              style={[
                styles.budgetInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
            <Text
              style={[styles.suffix, { color: colors.mutedForeground }]}
            >
              MAD
            </Text>
            <Pressable
              onPress={handleSaveGlobal}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: colors.foreground,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[styles.saveBtnText, { color: colors.background }]}
              >
                Save
              </Text>
            </Pressable>
          </View>
          {globalBudget ? (
            <View style={{ marginTop: 14 }}>
              <BudgetBar
                label="This month"
                spent={monthTotal}
                budget={globalBudget.amount}
                color={colors.accent}
              />
            </View>
          ) : null}
        </View>

        <Text style={[styles.section, { color: colors.foreground }]}>
          Per-category limits
        </Text>
        <Text style={[styles.sectionDetail, { color: colors.mutedForeground }]}>
          Tap any category to set a monthly cap. Set to 0 to remove.
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {CATEGORIES.map((cat, i) => {
            const budget = projectBudgets.find(
              (b) => b.scope === "category" && b.categoryId === cat.id,
            );
            const spent = categorySpend[cat.id] ?? 0;
            const isEditing = editingCat === cat.id;
            return (
              <View key={cat.id}>
                <Pressable
                  onPress={() => {
                    if (isEditing) {
                      setEditingCat(null);
                      return;
                    }
                    setEditingCat(cat.id);
                    setCatInput(budget ? String(budget.amount) : "");
                  }}
                  style={({ pressed }) => [
                    styles.catRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: cat.color + "1F" },
                    ]}
                  >
                    <Feather
                      name={cat.icon}
                      size={16}
                      color={cat.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.catName,
                        { color: colors.foreground },
                      ]}
                    >
                      {cat.label}
                    </Text>
                    <Text
                      style={[
                        styles.catMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {budget
                        ? `${formatCurrency(spent, { compact: true })} of ${formatCurrency(budget.amount, { compact: true })}`
                        : `${formatCurrency(spent, { compact: true })} • no limit`}
                    </Text>
                  </View>
                  <Feather
                    name={isEditing ? "chevron-up" : "edit-3"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
                {budget && !isEditing ? (
                  <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
                    <BudgetBar
                      label=""
                      spent={spent}
                      budget={budget.amount}
                      color={cat.color}
                      compact
                    />
                  </View>
                ) : null}
                {isEditing ? (
                  <View style={styles.editPanel}>
                    <TextInput
                      value={catInput}
                      onChangeText={setCatInput}
                      placeholder="Monthly limit"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="decimal-pad"
                      autoFocus
                      style={[
                        styles.budgetInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.foreground,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.suffix,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      MAD
                    </Text>
                    <Pressable
                      onPress={() => handleSaveCategory(cat.id)}
                      style={({ pressed }) => [
                        styles.saveBtn,
                        {
                          backgroundColor: cat.color,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.saveBtnText, { color: "#fff" }]}
                      >
                        Save
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
                {i < CATEGORIES.length - 1 ? (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
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
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  summaryCard: {
    marginTop: 18,
    borderRadius: 20,
    padding: 18,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.7,
  },
  summaryValue: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginTop: 6,
  },
  summarySub: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  section: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 28,
    marginBottom: 4,
  },
  sectionDetail: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  suffix: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  catMeta: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  editPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
});
