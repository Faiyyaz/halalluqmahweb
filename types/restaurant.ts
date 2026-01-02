export type Restaurant = {
  $id: string;
  name: string;
  url: string;
  address: string | null | undefined;
  image: string | null;
  status: "pending" | "approved" | "rejected";
  coordinates: string | null;
};
