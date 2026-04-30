import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

import { CATEGORIES, CategoryId, suggestCategory } from "@/constants/categories";
import { useColors } from "@/hooks/useColors";
import { todayISO } from "@/lib/format";
import { Expense } from "@/lib/storage";

type Props = {
  initial?: Partial<Expense>;
  submitLabel: string;
  onSubmit: (data: {
    description: string;
    amount: number;
    category: CategoryId;
    date: string;
    notes?: string;
  }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export default function ExpenseForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(
    initial?.amount ? String(initial.amount) : "",
  );
  const [category, setCategory] = useState<CategoryId>(
    initial?.category ?? "materials",
  );
  const [categoryTouched, setCategoryTouched] = useState(
    initial?.category != null,
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (!categoryTouched && text.length > 2) {
      const suggested = suggestCategory(text);
      if (suggested) setCategory(suggested);
    }
  };

  const handleSubmit = async () => {
    const parsed = parseFloat(amount.replace(",", "."));
    if (!description.trim()) {
      Alert.alert("Missing info", "Please enter a description.");
      return;
    }
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("Invalid date", "Date must be YYYY-MM-DD.");
      return;
    }
    setSubmitting(true);
    try {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await onSubmit({
        description: description.trim(),
        amount: parsed,
        category,
        date,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      "Delete expense",
      "This expense will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
            await onDelete();
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
          paddingBottom: insets.bottom + 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          AMOUNT (MAD)
        </Text>
        <View
          style={[
            styles.amountWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: colors.foreground }]}
            autoFocus={!initial?.id}
          />
          <Text style={[styles.amountSuffix, { color: colors.mutedForeground }]}>
            MAD
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>
          DESCRIPTION
        </Text>
        <TextInput
          value={description}
          onChangeText={handleDescriptionChange}
          placeholder="e.g. Cement bags, Concrete delivery"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>
          CATEGORY
        </Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  setCategory(c.id);
                  setCategoryTouched(true);
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                style={({ pressed }) => [
                  styles.catChip,
                  {
                    backgroundColor: active ? c.color : colors.card,
                    borderColor: active ? c.color : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name={c.icon}
                  size={14}
                  color={active ? "#fff" : c.color}
                />
                <Text
                  style={[
                    styles.catChipText,
                    { color: active ? "#fff" : colors.foreground },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>
          DATE
        </Text>
        <View style={styles.dateRow}>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                flex: 1,
              },
            ]}
          />
          <Pressable
            onPress={() => setDate(todayISO())}
            style={({ pressed }) => [
              styles.todayBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.todayBtnText, { color: colors.foreground }]}>
              Today
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 20 }]}>
          NOTES (OPTIONAL)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any context, supplier, invoice #..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.input,
            styles.notesInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
        />

        {initial?.imageUri ? (
          <View style={{ marginTop: 16 }}>
            <Text
              style={[styles.label, { color: colors.mutedForeground }]}
            >
              RECEIPT
            </Text>
            <Image
              source={{ uri: initial.imageUri }}
              style={styles.receipt}
            />
          </View>
        ) : null}

        {onDelete ? (
          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteBtn,
              {
                borderColor: colors.destructive,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
            <Text
              style={[styles.deleteBtnText, { color: colors.destructive }]}
            >
              Delete expense
            </Text>
          </Pressable>
        ) : null}
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: colors.foreground,
              opacity: submitting ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.submitBtnText, { color: colors.background }]}>
            {submitLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    padding: 0,
  },
  amountSuffix: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  catChipText: {
    fontSize: 12.5,
    fontFamily: "Inter_600SemiBold",
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  todayBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  receipt: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    resizeMode: "cover",
  },
  deleteBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  deleteBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
