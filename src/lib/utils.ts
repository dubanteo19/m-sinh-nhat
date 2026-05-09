import type { Person } from "@/type/person";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ExifReader from "exifreader";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
export const extractYear = async (file: File): Promise<number> => {
  const currentYear = new Date().getFullYear();

  try {
    const tags = await ExifReader.load(file);

    const dateTaken =
      tags["DateTimeOriginal"]?.description ||
      tags["DateTimeDigitized"]?.description ||
      tags["DateTime"]?.description;

    if (dateTaken) {
      const year = parseInt(dateTaken.split(":")[0], 10);

      if (!isNaN(year) && year > 1900 && year <= currentYear + 1) {
        return year;
      }
    }
  } catch (metadataError) {
    console.warn("EXIF read failed, falling back to current year.");
  }
  return currentYear;
};
