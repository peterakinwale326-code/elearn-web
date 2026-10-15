const courseImageRules: Array<[RegExp, string, string]> = [
  [/agricultural science/i, "Agriculture", "photo-1500382017468-9049fed747ef"],
  [/basic science|biology/i, "Science", "photo-1576086213369-97a306d36557"],
  [/chemistry/i, "Science", "photo-1532094349884-543bc11b234d"],
  [/physics/i, "Science", "photo-1635070041078-e363dbe005cb"],
  [/mathematics/i, "Mathematics", "photo-1509228468518-180dd4864904"],
  [/accounting|business studies|economics/i, "Business", "photo-1556761175-b413da4baf72"],
  [/civic education|government|social studies/i, "Social Studies", "photo-1529107386315-e1a2ed48a620"],
  [/english studies|literature in english/i, "English", "photo-1506880018603-83d5b814b5a6"],
  [/physical and health education|physical education/i, "Health & PE", "photo-1517836357463-d25dfeac3438"],
  [/basic technology/i, "Technology", "photo-1581091226825-a6a2a5aee158"],
  [/computer studies|^(c\+\+|c#|cobol|css|dart|html|java|javascript|php|python|ruby|typescript)$/i, "Computer Science", "photo-1498050108023-c5249f4df085"],
];

const subjectImages: Record<string, string> = {
  Science: "photo-1532094349884-543bc11b234d",
  Mathematics: "photo-1509228468518-180dd4864904",
  English: "photo-1506880018603-83d5b814b5a6",
  History: "photo-1461360228754-6e81c478b882",
  Technology: "photo-1518770660439-4636190af475",
  Business: "photo-1556761175-b413da4baf72",
  Art: "photo-1561214115-f2f134cc4912",
  Languages: "photo-1546410531-bb4caa6b424d",
  Geography: "photo-1501785888041-af3ef285b470",
  Health: "photo-1576091160399-112ba8d25d1d",
  Music: "photo-1524368535928-5b5e00ddc76b",
};

function imageUrl(photoId: string) {
  return `/media/course-images/${photoId}.jpg`;
}

export function getCourseImage(title: string, subject?: string, savedUrl?: string | null) {
  const courseImage = courseImageRules.find(([pattern]) => pattern.test(title))?.[2];
  if (courseImage) return imageUrl(courseImage);
  const subjectImage = subjectImages[subject || ""];
  if (subjectImage) return imageUrl(subjectImage);
  if (savedUrl?.startsWith("/")) return savedUrl;
  return imageUrl("photo-1503676260728-1c00da094a0b");
}

export function getCourseSubject(title: string, subject?: string) {
  return courseImageRules.find(([pattern]) => pattern.test(title))?.[1] || subject || "General";
}

export function getLessonImage(courseTitle: string, courseLevel: string, moduleTitle: string, lessonTitle: string) {
  const key = `${courseTitle}|${courseLevel}|${moduleTitle}|${lessonTitle}`.normalize("NFKC");
  let firstHash = 0x811c9dc5;
  let secondHash = 0x9e3779b9;

  for (let index = 0; index < key.length; index += 1) {
    const code = key.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ code, 0x01000193);
    secondHash = Math.imul(secondHash ^ code, 0x85ebca6b);
  }

  const name = `${(firstHash >>> 0).toString(16).padStart(8, "0")}${(secondHash >>> 0).toString(16).padStart(8, "0")}`;
  return `/media/lesson-diagrams/${name}.svg`;
}
