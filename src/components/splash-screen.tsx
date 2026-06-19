import { Spinner } from "@/components/ui/spinner.tsx";

export function SplashScreen() {
  return (
    <div className="h-svh w-svw flex justify-center items-center">
      <Spinner className="size-7" />
    </div>
  );
}
