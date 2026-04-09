import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "credentials" | "verify";

interface FieldErrors {
  email?: string;
  password?: string;
  code?: string;
}

export default function SignIn() {
  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");

  const isBusy = fetchStatus === "fetching";

  const validateCredentials = () => {
    const errs: FieldErrors = {};
    if (!EMAIL_REGEX.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearErrors = () => {
    setFieldErrors({});
    setGlobalError("");
  };

  const handleSubmit = async () => {
    if (!validateCredentials()) return;
    clearErrors();
    try {
      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) return;

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/(tabs)/");
            router.replace(url as any);
          },
        });
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await signIn.mfa.sendEmailCode();
        setStep("verify");
      }
    } catch (err: any) {
      setGlobalError(err?.message ?? "Something went wrong. Please try again.");
    }
  };

  const handleVerify = async () => {
    clearErrors();
    if (!code.trim()) {
      setFieldErrors({ code: "Enter the verification code." });
      return;
    }
    try {
      await signIn.mfa.verifyEmailCode({ code });
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/(tabs)/");
            router.replace(url as any);
          },
        });
      }
    } catch (err: any) {
      setGlobalError(err?.message ?? "Verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      await signIn.mfa.sendEmailCode();
    } catch (err: any) {
      setGlobalError(err?.message ?? "Failed to resend code. Please try again.");
    }
  };

  const emailError = fieldErrors.email ?? clerkErrors?.fields?.identifier?.message;
  const passwordError = fieldErrors.password ?? clerkErrors?.fields?.password?.message;
  const codeError = fieldErrors.code ?? clerkErrors?.fields?.code?.message;

  if (step === "verify") {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="auth-screen"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
          >
            <View className="auth-brand-block">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <Text className="auth-wordmark">Recurly</Text>
              <Text className="auth-wordmark-sub">Smart Billing</Text>
            </View>

            <Text className="auth-title mt-8 text-center">Check your email</Text>
            <Text className="auth-subtitle self-center">
              We sent a 6-digit code to {email}
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                {globalError ? (
                  <View className="rounded-xl bg-destructive/10 px-4 py-3">
                    <Text className="text-sm font-sans-medium text-destructive">
                      {globalError}
                    </Text>
                  </View>
                ) : null}

                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${codeError ? "auth-input-error" : ""}`}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                  {codeError ? (
                    <Text className="auth-error">{codeError}</Text>
                  ) : null}
                </View>

                <Pressable
                  className={`auth-button ${isBusy || !code ? "auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={isBusy || !code}
                >
                  <Text className="auth-button-text">
                    {isBusy ? "Verifying..." : "Verify"}
                  </Text>
                </Pressable>

                <Pressable className="auth-secondary-button" onPress={handleResend}>
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    setStep("credentials");
                    setCode("");
                    clearErrors();
                  }}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-screen"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-brand-block">
            <View className="auth-logo-mark">
              <Text className="auth-logo-mark-text">R</Text>
            </View>
            <Text className="auth-wordmark">Recurly</Text>
            <Text className="auth-wordmark-sub">Smart Billing</Text>
          </View>

          <Text className="auth-title mt-8 text-center">Welcome back</Text>
          <Text className="auth-subtitle self-center">
            Sign in to continue managing your subscriptions
          </Text>

          <View className="auth-card">
            <View className="auth-form">
              {globalError ? (
                <View className="rounded-xl bg-destructive/10 px-4 py-3">
                  <Text className="text-sm font-sans-medium text-destructive">
                    {globalError}
                  </Text>
                </View>
              ) : null}

              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={`auth-input ${emailError ? "auth-input-error" : ""}`}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
                {emailError ? <Text className="auth-error">{emailError}</Text> : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <View className="relative">
                  <TextInput
                    className={`auth-input pr-16 ${passwordError ? "auth-input-error" : ""}`}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      if (fieldErrors.password)
                        setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                  />
                  <Pressable
                    className="absolute right-4 top-0 bottom-0 justify-center"
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={8}
                  >
                    <Text className="text-sm font-sans-semibold text-accent">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
                {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
              </View>

              <Pressable
                className={`auth-button ${isBusy || !email || !password ? "auth-button-disabled" : ""}`}
                onPress={handleSubmit}
                disabled={isBusy || !email || !password}
              >
                <Text className="auth-button-text">
                  {isBusy ? "Signing in..." : "Sign in"}
                </Text>
              </Pressable>

              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Pressable>
                    <Text className="auth-link">Create an account</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
