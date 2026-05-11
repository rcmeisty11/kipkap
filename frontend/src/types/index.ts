export interface User {
  id: number;
  email: string;
  role: "teacher" | "leader" | "admin";
  teacher_id: number | null;
  clever_id: string | null;
  created_at: string;
}

export interface District {
  id: number;
  clever_id: string;
  name: string;
  synced_at: string;
}

export interface School {
  id: number;
  clever_id: string;
  district_id: number;
  name: string;
  sis_id: string | null;
  synced_at: string;
}

export interface Teacher {
  id: number;
  clever_id: string;
  school_id: number;
  email: string;
  first_name: string;
  last_name: string;
  synced_at: string;
}

export interface Section {
  id: number;
  clever_id: string;
  school_id: number;
  teacher_id: number;
  name: string;
  subject: string | null;
  grade: string | null;
  sis_id: string | null;
  synced_at: string;
}

export interface Student {
  id: number;
  clever_id: string;
  school_id: number;
  first_name: string;
  last_name: string;
  grade: string | null;
  sis_id: string | null;
  is_ml: boolean;
  is_dl: boolean;
  synced_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  subject: string | null;
  max_score: number;
  due_date: string | null;
  standard_id?: number | null;
  illuminate_id: string | null;
  section_id: number;
  teacher_id: number;
  created_at: string;
  updated_at: string;
}

export interface StudentScore {
  id: number;
  assignment_id: number;
  student_id: number;
  score: number | null;
  override_score: number | null;
  notes: string | null;
  edited_by_teacher_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Standard {
  id: number;
  code: string;
  description: string;
  subject: string | null;
  grade_level: string | null;
  framework: string | null;
}

export interface AssignmentGroup {
  id: number;
  name: string;
  standard_id: number | null;
  section_id: number;
  teacher_id: number;
  position: number;
  items: AssignmentGroupItem[];
}

export interface AssignmentGroupItem {
  id: number;
  group_id: number;
  assignment_id: number;
  position: number;
}

export interface FocusGroup {
  id: number;
  name: string;
  section_id: number;
  teacher_id: number;
  color: string;
  created_at: string;
  member_ids: number[];
}

export interface ActionStepRubric {
  id: number;
  title: string;
  description: string | null;
  school_id: number;
  created_by_user_id: number;
  created_at: string;
  criteria: RubricCriteria[];
}

export interface RubricCriteria {
  id: number;
  rubric_id: number;
  title: string;
  description: string | null;
  levels_json: RubricLevel[];
  position: number;
}

export interface RubricLevel {
  level: number;
  label: string;
  desc: string;
}

export interface TeacherFeedback {
  id: number;
  rubric_id: number;
  teacher_id: number;
  leader_id: number;
  criteria_ratings_json: Record<string, number>;
  overall_notes: string | null;
  created_at: string;
}

export interface TeacherReflection {
  id: number;
  feedback_id: number;
  teacher_id: number;
  reflection_text: string;
  submitted_at: string;
}

export interface RollupTeacher {
  teacher_id: number;
  teacher_name: string;
  school_name: string;
  section_count: number;
  assignment_count: number;
  avg_score: number;
}

export interface StudentRow {
  student: Student;
  scores: Record<number, StudentScore>;
  focusGroups: string[];
  sectionName?: string;
}
