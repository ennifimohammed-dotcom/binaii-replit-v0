import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Empty from "@/components/Empty";
import ExpenseForm from "@/components/ExpenseForm";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { expenses, updateExpense, deleteExpense } = useApp();

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Empty
          icon="alert-circle"
          title="Expense not found"
          detail="This entry may have been deleted."
        />
      </View>
    );
  }

  const handleSubmit = async (data: {
    description: string;
    amount: number;
    category: any;
    date: string;
    notes?: string;
  }) => {
    await updateExpense(expense.id, data);
    router.back();
  };

  const handleDelete = async () => {
    await deleteExpense(expense.id);
    router.back();
  };

  return (
    <ExpenseForm
      initial={expense}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
