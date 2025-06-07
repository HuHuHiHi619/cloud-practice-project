import { error } from "console";
import { loginUserAccount } from "../auth";

type State = {
  error: string;
};

export async function loginUserAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) throw new Error("Missing email or password");
  await loginUserAccount({ email, password });
  return { error: "Invalid login" };
}
