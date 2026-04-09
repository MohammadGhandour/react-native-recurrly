import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { useClerk } from "@clerk/expo";
import { Alert, Pressable, Text } from "react-native";

const Settings = () => {
  const { signOut } = useClerk();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary mb-6">Settings</Text>
      <Pressable
        className="items-center rounded-2xl bg-accent py-4"
        onPress={async () => {
          try {
            await signOut();
          } catch (err: any) {
            Alert.alert("Sign out failed", err?.message ?? "Something went wrong. Please try again.");
          }
        }}
      >
        <Text className="text-base font-sans-bold text-primary">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;