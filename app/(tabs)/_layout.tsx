import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
 <Tabs.Screen name="login" options={{ title: "LoginScreen" }} />    </Tabs>
  );
}
