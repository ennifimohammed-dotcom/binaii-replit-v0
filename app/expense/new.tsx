import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

import ExpenseForm from "@/components/ExpenseForm";
import { useApp } from "@/context/AppContext";

export default function NewExpenseScreen() {
  const { addExpense, activeProjectId } = useApp();

  const handleSubmit = async (data: {
    description: string;
    amount: number;
    category: any;
    date: string;
    notes?: string;
  }) => {
    if (!activeProjectId) {
      Alert.alert("No project", "Create a project first.");
      return;
    }
    await addExpense({
      ...data,
      projectId: activeProjectId,
    });
    router.back();
  };

  return <ExpenseForm submitLabel="Save expense" onSubmit={handleSubmit} />;
}
