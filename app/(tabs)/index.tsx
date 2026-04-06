import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

/**
 * Renders the app's home screen with a welcome message and navigation links.
 *
 * The component returns a SafeAreaView containing a bold welcome Text and Link components
 * for onboarding, sign-in, sign-up, a Spotify subscription, and a dynamic subscription
 * route with `id: "claude"`.
 *
 * @returns A React element representing the home screen UI with the described navigation links.
 */
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">Go to Onboarding</Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">Go to SignIn</Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">Go to SignUp</Link>
      <Link href="/subscriptions/spotify" className="mt-4 rounded bg-primary text-white p-4">Spotify Subscription</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: { id: "claude" },
      }}
        className="mt-4 rounded bg-primary text-white p-4">
        Claude Max Subscription
      </Link>
    </SafeAreaView>
  );
}