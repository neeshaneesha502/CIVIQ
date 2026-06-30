export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  likes?: number;
  likedBy?: string[];
  replies?: Comment[];
  isReported?: boolean;
  isEdited?: boolean;
}

export interface ProcessStage {
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  date?: string;
  photo?: string;
  description: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Resolved";
  latitude: number;
  longitude: number;
  assignedTo: string;
  type: "emergency" | "bbmp" | "localfixer" | "volunteer";
  payment: string;
  sla: number; // total hours permitted
  hoursPassed: number; // simulated hours elapsed
  upvotes: number;
  safetyRisk?: boolean;
  address: string;
  date: string;
  angerIndex: number;
  department: string;
  estimatedTime: string;
  actionItems: string[];
  urgencyReason: string;
  qualityScore?: number;
  beforePhoto?: string;
  afterPhoto?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  claimedBy?: string;
  fundingSource?: string;
  isVoted?: boolean;
  isSaved?: boolean;
  isUserReported?: boolean;
  reportedBy?: string;
  video?: string;
  reopenCount?: number;
  comments?: Comment[];
  processStages?: ProcessStage[];
  userCompletedList?: string[];
  aiWorkSummary?: string;
  aiWorkKPIs?: string[];
  evidenceSubmissions?: { email: string; name: string; date: string; beforePhoto?: string; afterPhoto?: string; notes?: string[] }[];
}

export interface UserStats {
  points: number;
  missionsCompleted: number;
  badge: string;
  name: string;
  email: string;
  isLocalFixer: boolean;
  fixerSpecialty?: string;
  fixerLicense?: string;
  fixerRating?: number;
  fixerEarnings?: number;
  fixerJobsDone?: number;
  residingArea?: string;
  ward?: string;
  reportedCommentsNotifications?: {
    commentId: string;
    commentText: string;
    issueTitle: string;
    issueId: string;
    date: string;
    reason?: string;
    isReportedByMe?: boolean;
    reportedAuthor?: string;
  }[];
}
