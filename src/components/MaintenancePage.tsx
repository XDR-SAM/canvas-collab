import { Wrench } from "lucide-react";

const MaintenancePage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <Wrench className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Under Maintenance</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We're performing scheduled maintenance. Please check back shortly.
      </p>
    </div>
  );
};

export default MaintenancePage;
