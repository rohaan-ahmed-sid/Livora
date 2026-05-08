import { Leaf } from "lucide-react";

interface LivoraLogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 28, text: "text-2xl" },
  lg: { icon: 40, text: "text-4xl" },
};

const LivoraLogo = ({ size = "md" }: LivoraLogoProps) => {
  const s = sizeMap[size];
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Leaf size={s.icon} className="text-primary" strokeWidth={2.5} />
      </div>
      <span className={`${s.text} font-bold tracking-tight text-foreground`}>
        LIVORA
      </span>
    </div>
  );
};

export default LivoraLogo;
