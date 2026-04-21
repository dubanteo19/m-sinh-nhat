export type Person = {
  id: string;
  name: string;
  dob: string;
};

export type PersonView = Person & {
  remaining: number;
  displayDob: string;
};
