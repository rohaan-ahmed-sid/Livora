import { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";

const StepDevices = () => {
  const [cgmBrand, setCgmBrand] = useState("");
  const [wearableBrand, setWearableBrand] = useState("");

  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Connect Devices</h1>
        <p className="text-sm text-muted-foreground mt-1">Sync your glucose and activity data:</p>
      </div>

      {/* Glucose Sensor */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Glucose Sensor:</label>
        <div className="relative">
          <select
            value={cgmBrand}
            onChange={(e) => setCgmBrand(e.target.value)}
            className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-3 outline-none focus:ring-1 focus:ring-primary appearance-none pr-8"
          >
            <option value="">Select Brand (e.g., Dexcom)</option>
            <option value="dexcom">Dexcom</option>
            <option value="freestyle">FreeStyle Libre</option>
            <option value="medtronic">Medtronic</option>
            <option value="eversense">Eversense</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
          Connect
        </button>
      </div>

      {/* Activity/BP Tracking */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Activity/BP Tracking:</label>
        <div className="relative">
          <select
            value={wearableBrand}
            onChange={(e) => setWearableBrand(e.target.value)}
            className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-3 outline-none focus:ring-1 focus:ring-primary appearance-none pr-8"
          >
            <option value="">Select Brand (e.g., Apple Health)</option>
            <option value="apple">Apple Health</option>
            <option value="google">Google Fit</option>
            <option value="fitbit">Fitbit</option>
            <option value="samsung">Samsung Health</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
          Connect
        </button>
      </div>

      {/* Manual Entry Notice */}
      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Pencil size={14} className="text-accent" />
          <p className="text-xs font-semibold text-foreground">No device? No problem!</p>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          If you don't have monitoring devices, you can manually enter your Glucose, Blood Pressure, Activity, and Sleep data directly in the app after setup.
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        *You can connect the devices later as well. In case you do not have real time monitoring devices, you would be required to manually input Glucose and Blood Pressure, along with activity details, sleep schedule, diet, etc.
      </p>
    </div>
  );
};

export default StepDevices;
