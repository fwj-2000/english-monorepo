//packages/common/course/index.ts
export interface Course {
  id: string;
  name: string;
  value: string;
  description: string;
  teacher: string;
  url: string;
  price: string; // 课程价格
}

export type CourseList = Course[];