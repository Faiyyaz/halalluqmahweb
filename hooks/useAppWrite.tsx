import {
  EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  EXPO_PUBLIC_APPWRITE_ENDPOINT,
  EXPO_PUBLIC_APPWRITE_PROJECT_ID,
} from "@/utils/constants";
import {
  Account,
  Client,
  ID,
  Models,
  Permission,
  Role,
  TablesDB,
} from "appwrite";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

type AppWriteContextType = {
  register: (params: {
    email: string;
    password: string;
    name: string;
    mobileNumber?: string;
  }) => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (params: { email: string }) => Promise<void>;
  updatePassword: (params: {
    userId: string;
    secret: string;
    password: string;
  }) => Promise<void>;
  updateProfile: (params: {
    email: string;
    name: string;
    mobileNumber?: string;
  }) => Promise<void>;
  addRestaurant: (params: { name: string; url: string }) => Promise<void>;
  loggedInUser: Models.User<Models.Preferences> | null;
  loading: boolean;
  client: Client;
  profile: {
    name: string;
    email: string;
    mobileNumber?: string;
  };
  isSubmitting: boolean;
  databases: TablesDB;
};

const AppWriteContext = createContext<AppWriteContextType | null>(null);
const client = new Client()
  .setProject(EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setEndpoint(EXPO_PUBLIC_APPWRITE_ENDPOINT);
const account = new Account(client);
const databases = new TablesDB(client);
const authRoutes = ["login", "register", "reset", "forgot"];

export function AppWriteProvider({ children }: { children: React.ReactNode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  /* ------------------------------------------------------------------ */
  /* Auth state                                                          */
  /* ------------------------------------------------------------------ */
  const [loggedInUser, setLoggedInUser] =
    useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    mobileNumber?: string;
  }>({ name: "", email: "", mobileNumber: undefined });

  /* ------------------------------------------------------------------ */
  /* Check existing session on app start                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    async function checkSession() {
      try {
        const user = await account.get();
        setLoggedInUser(user);
      } catch {
        setLoggedInUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  // Handle logout
  useEffect(() => {
    // last segment is usually the current screen
    const currentRoute = router.pathname.split("/").pop() || "";

    if (!loading && !loggedInUser && !authRoutes.includes(currentRoute)) {
      router.replace("/login");
    } else if (
      !loading &&
      loggedInUser &&
      (currentRoute === "" || authRoutes.includes(currentRoute))
    ) {
      router.replace("/home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, loading]);

  // Fetch user profile when loggedInUser changes
  useEffect(() => {
    async function fetchUserProfile() {
      setIsSubmitting(true);
      if (!loggedInUser) {
        setIsSubmitting(false);
        setProfile({ name: "", email: "", mobileNumber: undefined });
        return;
      }

      try {
        const row = await databases.getRow({
          databaseId: EXPO_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: "users",
          rowId: loggedInUser.$id,
        });

        setProfile({
          name: row.name,
          email: row.email,
          mobileNumber: row.mobileNumber || undefined,
        });
        setIsSubmitting(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsSubmitting(false);
      }
    }

    fetchUserProfile();
  }, [loggedInUser]);

  /* ------------------------------------------------------------------ */
  /* Auth actions                                                        */
  /* ------------------------------------------------------------------ */
  async function login({
    email,
    password,
    isFromRegister = false,
  }: {
    email: string;
    password: string;
    isFromRegister?: boolean;
  }) {
    try {
      if (!isFromRegister) {
        setIsSubmitting(true);
      }

      await account.createEmailPasswordSession({ email, password });
      const user = await account.get();
      setLoggedInUser(user);
      if (!isFromRegister) {
        setIsSubmitting(false);
      }
    } catch (error) {
      setLoggedInUser(null);
      if (!isFromRegister) {
        setIsSubmitting(false);
      }
      throw error;
    }
  }

  async function logout() {
    try {
      setIsSubmitting(true);
      await account.deleteSession({
        sessionId: "current",
      });
      setLoggedInUser(null);
      setIsSubmitting(false);
      console.log("Logged out successfully");
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  async function register({
    email,
    password,
    name,
    mobileNumber,
  }: {
    email: string;
    password: string;
    name: string;
    mobileNumber?: string;
  }) {
    try {
      setIsSubmitting(true);
      const user = await account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });

      // Auto-login
      await login({ email, password, isFromRegister: true });

      // Create user row
      await databases.createRow({
        databaseId: EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        tableId: "users",
        rowId: user.$id,
        data: {
          name,
          email,
          mobileNumber: mobileNumber || "",
          isActive: true,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      });

      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  async function forgotPassword({ email }: { email: string }) {
    try {
      setIsSubmitting(true);
      await account.createRecovery({
        email,
        url: "halalluqmah://reset",
      });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  async function updatePassword({
    userId,
    secret,
    password,
  }: {
    userId: string;
    secret: string;
    password: string;
  }) {
    try {
      setIsSubmitting(true);
      await account.updateRecovery({
        userId,
        secret,
        password,
      });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  /* ------------------------------------------------------------------ */
  /* App actions                                                         */
  /* ------------------------------------------------------------------ */
  async function addRestaurant({ name, url }: { name: string; url: string }) {
    try {
      setIsSubmitting(true);
      if (!loggedInUser) {
        setIsSubmitting(false);
        return;
      }

      await databases.createRow({
        databaseId: EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        tableId: "restaurants",
        rowId: ID.unique(),
        data: {
          name,
          url,
          users: loggedInUser.$id,
        },
        permissions: [
          Permission.read(Role.users()),
          Permission.update(Role.user(loggedInUser.$id)),
          Permission.delete(Role.user(loggedInUser.$id)),
        ],
      });

      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  async function updateProfile({
    email,
    name,
    mobileNumber,
  }: {
    email: string;
    name: string;
    mobileNumber?: string;
  }) {
    try {
      setIsSubmitting(true);
      if (!loggedInUser) {
        setIsSubmitting(false);
        return;
      }

      // Update account info
      await account.updateName({
        name,
      });

      // Update user row
      await databases.updateRow({
        databaseId: EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        tableId: "users",
        rowId: loggedInUser.$id,
        data: {
          name,
          email,
          mobileNumber: mobileNumber || "",
        },
      });
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }

  /* ------------------------------------------------------------------ */
  return (
    <AppWriteContext.Provider
      value={{
        register,
        login,
        logout,
        forgotPassword,
        updatePassword,
        addRestaurant,
        loggedInUser,
        loading,
        client,
        updateProfile,
        profile,
        isSubmitting,
        databases,
      }}
    >
      {children}
    </AppWriteContext.Provider>
  );
}

/* -------------------------------------------------------------------- */
/* Hook                                                                 */
/* -------------------------------------------------------------------- */
export function useAppWrite() {
  const ctx = useContext(AppWriteContext);
  if (!ctx) {
    throw new Error("useAppWrite must be used inside AppWriteProvider");
  }
  return ctx;
}
