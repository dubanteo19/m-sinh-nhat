import type { Person } from "@/type/person";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const toPersonView = (person: Person) => {
  const today = new Date();
  const nextBirthday = getNextBirthDay(person.dob);
  const diffTime = nextBirthday.getTime() - today.getTime();
  const remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const displayDob = nextBirthday.toLocaleDateString("vi-VN", {
    month: "long",
    day: "numeric",
  });
  return { ...person, remaining, displayDob };
};

export const getNextBirthDay = (dob: string) => {
  const today = new Date();
  const [year, month, day] = dob.split("-");
  const birthDate = new Date(Number(year), Number(month) - 1, Number(day));

  const next = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );
  if (next <= today) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return next;
};