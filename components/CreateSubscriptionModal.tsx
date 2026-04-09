import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#ffd6a5",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c7f0bd",
  Cloud: "#b8d0e8",
  Music: "#f0b8d4",
  Other: "#e0e0e0",
};

type Frequency = "Monthly" | "Yearly";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const DISMISS_THRESHOLD = 120;
const DISMISS_VELOCITY = 800;

export default function CreateSubscriptionModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  const translateY = useSharedValue(0);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setNameError("");
    setPriceError("");
  };

  const handleClose = () => {
    translateY.value = 0;
    resetForm();
    onClose();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const parsedPrice = parseFloat(price);
  const isValid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const handleSubmit = () => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setPriceError("Enter a valid price.");
      valid = false;
    } else {
      setPriceError("");
    }

    if (!valid) return;

    const now = dayjs();
    const renewal = frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const subscription: Subscription = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
      icon: icons.wallet,
      color: CATEGORY_COLORS[category],
    };

    onSubmit(subscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Animated.View
            className="modal-container"
            style={animatedStyle}
            onStartShouldSetResponder={() => true}
          >
            {/* Drag handle */}
            <GestureDetector gesture={panGesture}>
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(0,0,0,0.15)",
                  }}
                />
              </View>
            </GestureDetector>

            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose} hitSlop={8}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="modal-body"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
            >
              {/* Name */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx("auth-input", nameError && "auth-input-error")}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={name}
                  onChangeText={(v) => {
                    setName(v);
                    if (nameError) setNameError("");
                  }}
                  returnKeyType="next"
                />
                {nameError ? <Text className="auth-error">{nameError}</Text> : null}
              </View>

              {/* Price */}
              <View className="auth-field">
                <Text className="auth-label">Price (USD)</Text>
                <TextInput
                  className={clsx("auth-input", priceError && "auth-input-error")}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={price}
                  onChangeText={(v) => {
                    setPrice(v);
                    if (priceError) setPriceError("");
                  }}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                {priceError ? <Text className="auth-error">{priceError}</Text> : null}
              </View>

              {/* Frequency */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as Frequency[]).map((f) => (
                    <Pressable
                      key={f}
                      className={clsx("picker-option", frequency === f && "picker-option-active")}
                      onPress={() => setFrequency(f)}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === f && "picker-option-text-active"
                        )}
                      >
                        {f}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c}
                      className={clsx("category-chip", category === c && "category-chip-active")}
                      onPress={() => setCategory(c)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === c && "category-chip-text-active"
                        )}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <Pressable
                className={clsx("auth-button", !isValid && "auth-button-disabled")}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </Pressable>
    </Modal>
  );
}
