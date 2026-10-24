"use client";

import { useRegisterPageVm } from "@/modules/auth/viewModel/register/registerPageVm";
import { RegisterPageView } from "@/modules/auth/view/register/RegisterPageView";

export default function RegisterPage() {
  const vm = useRegisterPageVm();
  return <RegisterPageView vm={vm} />;
}
