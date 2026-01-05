import HLButton from "@/components/buttons/HLButton";
import HLText from "@/components/text/HLText";
import { useAppWrite } from "@/hooks/useAppWrite";

export default function Login() {
  const { login } = useAppWrite();

  async function handleLogin() {
    try {
      await login({ email: "kfaiyyaz93@gmail.com", password: "Password@1" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <div>
      <HLText variant="title" text="Login Page" />
      <HLButton onPress={handleLogin} text="Login" />
    </div>
  );
}
