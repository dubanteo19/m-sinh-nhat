import { PersonCard } from "@/components/person-card";
import { people } from "@/data/people";

export const HomePage = () => {
  const getNextBirthDay = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const next = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDay(),
    );
    if (next < today) {
      next.setFullYear(today.getFullYear() + 1);
    }
    return next;
  };
  const sortedPeope = [...people].sort((a, b) => {
    const dateA = getNextBirthDay(a.dob);
    const dateB = getNextBirthDay(b.dob);
    return dateA.getTime() - dateB.getTime();
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 py-10 px-4">
      <div className="flex gap-2 flex-wrap">
        {sortedPeope.map((person) => (
          <PersonCard {...person} key={person.id} />
        ))}
      </div>
    </div>
  );
};
