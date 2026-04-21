import { cn } from "@/lib/utils";
import type { PersonView } from "@/type/person";
import { useNavigate } from "react-router-dom";

const colorMap: Record<string, string> = {
  teo: "bg-pink-400",
  tam: "bg-blue-400",
  thuy: "bg-green-400",
  thu: "bg-purple-400",
  thiet: "bg-yellow-400",
  hary: "bg-red-400",
  hieu: "bg-indigo-400",
};
export const PersonCard = ({ id, displayDob, name, remaining }: PersonView) => {
  const ids = ["thuy", "thu", "thiet", "hary"];
  const thao = ids.includes(id);
  const color = colorMap[id] || "bg-gray-400";
  const navigate = useNavigate();
  return (
    <div
      style={{
        animationDelay: `${ids.indexOf(id) * 0.2}s`,
      }}
      onClick={() => navigate(`/info/${id}`)}
      className={cn(
        "w-[180px] bg-white cursor-pointer relative rounded-2xl shadow-md hover:shadow-lg transition-shadow",
        "duration-300 p-5 flex flex-col items-center text-center  animate-[float_3s_ease-in-out_infinite]",
      )}
    >
      {thao && (
        <img
          width={30}
          className="absolute top-[5px] right-[2px] rotate-25"
          height={30}
          src="/bowtie.png"
        />
      )}
      {/* Avatar */}
      <div
        className={`w-16 ${color}  h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3`}
      >
        {name.charAt(0)}
      </div>
      {/* Name */}
      <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
      {/* Birthday */}
      <p className="text-gray-500 text-sm mt-1">🎂 {displayDob}</p>
      {/* Remainng */}
      <p className="text-red-600 font-bold text-sm mt-1">
        {remaining} ngày nựa
      </p>
    </div>
  );
};
