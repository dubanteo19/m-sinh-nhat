import type { Person } from "@/type/person";

const colorMap: Record<number, string> = {
  1: "bg-pink-400",
  2: "bg-blue-400",
  3: "bg-green-400",
  4: "bg-purple-400",
  5: "bg-yellow-400",
  6: "bg-red-400",
  7: "bg-indigo-400",
};
export const PersonCard = ({ id, dob, name }: Person) => {
  const parseDOB = (dob: string) => {
    const [year, month, day] = dob.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };
  const date = parseDOB(dob);
  const formattedDob = date.toLocaleDateString("vi-VN", {
    month: "long",
    day: "numeric",
  });

  const thao = id == 6;
  const color = colorMap[id] || "bg-gray-400";

  return (
    <div
      style={{
        animationDelay: `${id * 0.2}s`,
        background: thao
        ? `
        radial-gradient(#f9a8d4 2px, transparent 2px),
        radial-gradient(#f9a8d4 2px, transparent 2px),
        #ffffff`
        : undefined,
        backgroundSize: thao ? "16px 16px" : undefined,
        backgroundPosition: thao ? "0 0, 8px 8px" : undefined,
      }}
      className="w-[180px] bg-white  relative rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col items-center text-center  animate-[float_3s_ease-in-out_infinite]"
    >
      {thao && (
        <img
          width={30}
          className="absolute top-[5px] right-[2px] rotate-25"
          height={30}
          src="bowtie.png"
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
      <p className="text-gray-500 text-sm mt-1">🎂 {formattedDob}</p>
    </div>
  );
};
