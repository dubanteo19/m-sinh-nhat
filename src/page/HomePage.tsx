import { PersonCard } from "@/components/person-card";
import { people } from "@/data/people";
import { getNextBirthDay, toPersonView } from "@/lib/utils";

export const HomePage = () => {
  const others = [...people]
    .filter((p) => p.id !== "nhom")
    .sort((a, b) => {
      const dateA = getNextBirthDay(a.dob);
      const dateB = getNextBirthDay(b.dob);
      return dateA.getTime() - dateB.getTime();
    });
  const sortedPeope = [...others, ...people.filter((p) => p.id === "nhom")];
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 py-10 px-4">
      <div className="flex gap-2 flex-wrap">
        {sortedPeope.map(toPersonView).map((person) => (
          <PersonCard {...person} key={person.id} />
        ))}
      </div>
    </div>
  );
};
