import { Spinner } from "@/components/ui/spinner";

export function SplashScreen() {
  return (
    <div className="h-svh w-svw flex justify-center items-center">
      <Spinner className="size-7" />
    </div>
  );
}
