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

  return <button onClick={handleLogin}>Login</button>;
}
