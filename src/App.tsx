import React, { useState, useEffect } from "react";
import { Issue, UserStats, Comment } from "./types";
import { initialIssues, initialUserStats } from "./data/mockData";
import { SplashView } from "./components/screens/SplashView";
import { AuthView } from "./components/screens/AuthView";
import { HomeView } from "./components/screens/HomeView";
import { ReportView } from "./components/screens/ReportView";
import { FeedView } from "./components/screens/FeedView";
import { ProfileView } from "./components/screens/ProfileView";
import { VolunteerView } from "./components/screens/VolunteerView";
import { FixerView } from "./components/screens/FixerView";
import { DashboardView } from "./components/screens/DashboardView";
import { AdminView } from "./components/screens/AdminView";
import { KotlinExplorer } from "./components/KotlinExplorer";
import { CivicInfoView } from "./components/screens/CivicInfoView";
import { Home, List, PlusCircle, Map, MoreHorizontal, User, Award, Shield, Settings, Activity, X, Heart, MessageSquare, Flame, Wrench, Bookmark, Search, MapPin, AlertOctagon, Trash2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProcessTracker } from "./components/ProcessTracker";
import { VideoPlayer } from "./components/VideoPlayer";
import { sanitizeInput } from "./lib/sanitize";

export default function App() {
  // App Phase States
  const [phase, setPhase] = useState<"SPLASH" | "AUTH" | "APP">("SPLASH");
  
  // App Global State
  const [issues, setIssues] = useState<Issue[]>(() => {
    return initialIssues.map((issue, idx) => {
      // Make CIVIQ-001 (Open Manhole) and CIVIQ-003 (Raw Sewage) pre-saved and pre-reported for instant demo testing
      const isSaved = idx === 0 || idx === 2;
      const isUserReported = idx === 0 || idx === 4;
      return {
        ...issue,
        isSaved,
        isUserReported,
        video: issue.category.toLowerCase().includes("road") || issue.category.toLowerCase().includes("water")
          ? "https://assets.mixkit.co/videos/preview/mixkit-pothole-filled-with-rainwater-on-the-road-close-up-41617-large.mp4"
          : undefined
      };
    });
  });
  const [userStats, setUserStats] = useState<UserStats>(initialUserStats);
  
  // Save toggle & live comments & live notification states
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [toast, setToast] = useState<{ id: string; title: string; body: string; issueId: string } | null>(null);

  const triggerToast = (title: string, body: string, issueId: string) => {
    setToast({ id: String(Date.now()), title, body, issueId });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Saved issue background update simulator completely disabled per user constraints
  // No simulated background updates to ensure notifications are purely action-driven


  const handleToggleSaveIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextSaved = !i.isSaved;
          if (nextSaved) {
            triggerToast("Feed Saved 🌟", `Live updates enabled for: ${i.title.slice(0, 18)}...`, i.id);
          } else {
            triggerToast("Feed Unsaved 🗳️", `Disabled live tracking for: ${i.title.slice(0, 18)}...`, i.id);
          }
          return { ...i, isSaved: nextSaved };
        }
        return i;
      })
    );
    setSelectedIssue((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, isSaved: !prev.isSaved };
      }
      return prev;
    });
  };

  const renderCommentTextWithMentions = (text: string) => {
    return text;
  };

  const getCommentsForIssue = (issue: Issue) => {
    if (issue.comments && issue.comments.length > 0) {
      return issue.comments;
    }
    const category = issue.category.toLowerCase();
    if (category.includes("road") || category.includes("pothole")) {
      return [
        { id: "c1", author: "Ranganathan G.", text: "Thanks for logging! Same problem occurs here, need this resolved asap before monsoon water logs.", date: "2 hours ago", likes: 0, likedBy: [], replies: [] },
        { id: "c2", author: "Assistant Ward Engineer", text: "Site inspection scheduled. Work order dispatched to field team.", date: "1 hour ago", likes: 0, likedBy: [], replies: [] }
      ];
    } else if (category.includes("water") || category.includes("sewage") || category.includes("overflow")) {
      return [
        { id: "c1", author: "Meera Nair", text: "The sewage overflow is a major health hazard. Smells terrible and is extremely unsanitary.", date: "3 hours ago", likes: 0, likedBy: [], replies: [] },
        { id: "c2", author: "BWSSB Helpline", text: "Emergency sewer jetting machine allocated to Ward Sector. ETA 4 hours.", date: "2 hours ago", likes: 0, likedBy: [], replies: [] }
      ];
    } else {
      return [
        { id: "c1", author: "Ananth Kumar", text: "Noticed this during my morning walk. Appreciate the swift tracking on this app!", date: "Yesterday", likes: 0, likedBy: [], replies: [] }
      ];
    }
  };

  const findCommentById = (list: Comment[], id: string): Comment | null => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.replies) {
        const found = findCommentById(c.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [activeDropdownCommentId, setActiveDropdownCommentId] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedIssue) return;

    const cleanCommentText = sanitizeInput(newCommentText, 1000);
    const currentComments = [...getCommentsForIssue(selectedIssue)];

    if (editingCommentId) {
      // Editing existing comment
      const updateTextInComments = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === editingCommentId) {
            return { ...c, text: cleanCommentText, isEdited: true };
          }
          if (c.replies) {
            return { ...c, replies: updateTextInComments(c.replies) };
          }
          return c;
        });
      };

      const updatedComments = updateTextInComments(currentComments);
      setIssues((prev) =>
        prev.map((i) => (i.id === selectedIssue.id ? { ...i, comments: updatedComments } : i))
      );
      setSelectedIssue((prev) => prev ? { ...prev, comments: updatedComments } : null);
      setEditingCommentId(null);
      setNewCommentText("");
      triggerToast("Comment Edited ✏️", "Your discussion update has been updated on the ledger.", selectedIssue.id);
      return;
    }

    if (replyingToCommentId) {
      // Replying to some comment
      const newReply: Comment = {
        id: `reply-${Date.now()}`,
        author: userStats.name,
        text: cleanCommentText,
        date: "Just now",
        likes: 0,
        likedBy: [],
        replies: []
      };

      const appendReplyInComments = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === replyingToCommentId) {
            const currentReplies = c.replies || [];
            return { ...c, replies: [...currentReplies, newReply] };
          }
          if (c.replies) {
            return { ...c, replies: appendReplyInComments(c.replies) };
          }
          return c;
        });
      };

      const updatedComments = appendReplyInComments(currentComments);
      setIssues((prev) =>
        prev.map((i) => (i.id === selectedIssue.id ? { ...i, comments: updatedComments } : i))
      );
      setSelectedIssue((prev) => prev ? { ...prev, comments: updatedComments } : null);
      setReplyingToCommentId(null);
      setNewCommentText("");
      triggerToast("Reply Posted 💬", "Your reply has been synchronized with the discussion thread.", selectedIssue.id);
      return;
    }

    // Standard Comment
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: userStats.name,
      text: cleanCommentText,
      date: "Just now",
      likes: 0,
      likedBy: [],
      replies: []
    };

    const updatedComments = [...currentComments, newComment];
    setIssues((prev) =>
      prev.map((i) => (i.id === selectedIssue.id ? { ...i, comments: updatedComments } : i))
    );
    setSelectedIssue((prev) => prev ? { ...prev, comments: updatedComments } : null);
    setNewCommentText("");
    if (selectedIssue.isSaved) {
      triggerToast("Update Posted 💬", `Your comment was broadcasted on the saved report: "${selectedIssue.title.slice(0, 15)}..."`, selectedIssue.id);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedIssue) return;
    const currentComments = getCommentsForIssue(selectedIssue);

    const deleteFromComments = (list: Comment[]): Comment[] => {
      return list
        .filter(c => c.id !== commentId)
        .map(c => {
          if (c.replies) {
            return { ...c, replies: deleteFromComments(c.replies) };
          }
          return c;
        });
    };

    const updatedComments = deleteFromComments(currentComments);
    setIssues((prev) =>
      prev.map((i) => (i.id === selectedIssue.id ? { ...i, comments: updatedComments } : i))
    );
    setSelectedIssue((prev) => prev ? { ...prev, comments: updatedComments } : null);
    triggerToast("Comment Removed 🗑️", "Your comment was deleted from the immutable ledger.", selectedIssue.id);
  };

  const handleLikeComment = (commentId: string) => {
    if (!selectedIssue) return;
    const currentComments = getCommentsForIssue(selectedIssue);

    const likeInComments = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.id === commentId) {
          const likedBy = c.likedBy || [];
          const hasLiked = likedBy.includes(userStats.name);
          const nextLikedBy = hasLiked 
            ? likedBy.filter(name => name !== userStats.name)
            : [...likedBy, userStats.name];
          const nextLikes = (c.likes || 0) + (hasLiked ? -1 : 1);
          return { ...c, likes: nextLikes, likedBy: nextLikedBy };
        }
        if (c.replies) {
          return { ...c, replies: likeInComments(c.replies) };
        }
        return c;
      });
    };

    const updatedComments = likeInComments(currentComments);
    setIssues((prev) =>
      prev.map((i) => (i.id === selectedIssue.id ? { ...i, comments: updatedComments } : i))
    );
    setSelectedIssue((prev) => prev ? { ...prev, comments: updatedComments } : null);
  };

  const handleReportComment = (commentId: string, commentAuthor: string, commentText: string) => {
    if (!selectedIssue) return;
    const currentComments = getCommentsForIssue(selectedIssue);

    const reportInComments = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.id === commentId) {
          return { ...c, isReported: true };
        }
        if (c.replies) {
          return { ...c, replies: reportInComments(c.replies) };
        }
        return c;
      });
    };

    const updatedComments = reportInComments(currentComments);
    setIssues((prev) =>
      prev.map((i) => (i.id === selectedIssue.id ? { ...i, comments: updatedComments } : i))
    );
    setSelectedIssue((prev) => prev ? { ...prev, comments: updatedComments } : null);

    const newNotification = {
      commentId,
      commentText,
      issueTitle: selectedIssue.title,
      issueId: selectedIssue.id,
      date: "Just now",
      isReportedByMe: true,
      reportedAuthor: commentAuthor
    };

    setUserStats(prev => ({
      ...prev,
      reportedCommentsNotifications: [newNotification, ...(prev.reportedCommentsNotifications || [])]
    }));

    triggerToast("Comment Reported 🛡️", "The comment has been flagged for BBMP moderator verification.", selectedIssue.id);
  };
  
  // Selected View Tab (Home, Feed, Report, Map, More)
  const [selectedTab, setSelectedTab] = useState<string>("Home");
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [moreTabActive, setMoreTabActive] = useState<string>("");

  // Detailed Modal overlay state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [lastDeletedIssue, setLastDeletedIssue] = useState<Issue | null>(null);

  // Generate media list for selected issue carousel
  const selectedIssueMediaList = React.useMemo(() => {
    if (!selectedIssue) return [];
    const list: { type: "image" | "video"; url: string; label: string }[] = [];
    
    // 1. Primary Photo
    if (selectedIssue.beforePhotoUrl) {
      list.push({ type: "image", url: selectedIssue.beforePhotoUrl, label: "Primary Incident Photo" });
    } else {
      const categoryLower = selectedIssue.category.toLowerCase();
      let primaryUrl = "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80";
      if (categoryLower.includes("water") || categoryLower.includes("drain") || categoryLower.includes("sewage")) {
        primaryUrl = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80";
      } else if (categoryLower.includes("pothole") || categoryLower.includes("road") || categoryLower.includes("street")) {
        primaryUrl = "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=400&q=80";
      } else if (categoryLower.includes("light") || categoryLower.includes("electric")) {
        primaryUrl = "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=400&q=80";
      } else if (categoryLower.includes("garbage") || categoryLower.includes("waste") || categoryLower.includes("trash")) {
        primaryUrl = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&q=80";
      }
      list.push({ type: "image", url: primaryUrl, label: "Primary Incident Photo" });
    }

    // 2. Secondary Photo
    let secondaryUrl = "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80";
    const categoryLower = selectedIssue.category.toLowerCase();
    if (categoryLower.includes("water") || categoryLower.includes("drain") || categoryLower.includes("sewage")) {
      secondaryUrl = "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=400&q=80";
    } else if (categoryLower.includes("pothole") || categoryLower.includes("road") || categoryLower.includes("street")) {
      secondaryUrl = "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=400&q=80";
    } else if (categoryLower.includes("light") || categoryLower.includes("electric")) {
      secondaryUrl = "https://images.unsplash.com/photo-1473116763269-255ea7427be2?w=400&q=80";
    } else if (categoryLower.includes("garbage") || categoryLower.includes("waste") || categoryLower.includes("trash")) {
      secondaryUrl = "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&q=80";
    }
    list.push({ type: "image", url: secondaryUrl, label: "Detail Angle Photo" });

    // 3. Resolution Success Photo if resolved
    if (selectedIssue.status === "Resolved") {
      if (selectedIssue.afterPhotoUrl) {
        list.push({ type: "image", url: selectedIssue.afterPhotoUrl, label: "Resolution Success Photo" });
      } else {
        list.push({ type: "image", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", label: "Resolution Success Photo" });
      }
    }

    // 4. Video Evidence
    const videoUrl = selectedIssue.video || "https://assets.mixkit.co/videos/preview/mixkit-flowing-water-under-a-small-bridge-41662-large.mp4";
    list.push({ type: "video", url: videoUrl, label: "Video Evidence (Triage Loop)" });

    return list;
  }, [selectedIssue]);

  // Kotlin Code Explorer modal
  const [showKotlinHub, setShowKotlinHub] = useState<boolean>(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Time ticking for phone mock status bar
  const [timeStr, setTimeStr] = useState<string>("09:41");

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const hrs = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      setTimeStr(`${hrs}:${mins}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update stats wrapper
  const handleUpdateUserStats = (updated: Partial<UserStats>) => {
    setUserStats((prev) => ({ ...prev, ...updated }));
  };

  // Login callback
  const handleLoginSuccess = (name: string, email: string) => {
    setUserStats((prev) => ({ ...prev, name, email }));
    setPhase("APP");
  };

  // Upvote issue local handler
  const handleUpvoteIssue = (id: string) => {
    let issueTitle = "";
    let isAlreadyVoted = false;
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === id) {
          isAlreadyVoted = issue.isVoted;
          issueTitle = issue.title;
          const upvoted = isAlreadyVoted ? issue.upvotes - 1 : issue.upvotes + 1;
          
          setUserStats((prev) => ({
            ...prev,
            points: prev.points + (isAlreadyVoted ? -10 : 10)
          }));

          return {
            ...issue,
            upvotes: upvoted,
            isVoted: !isAlreadyVoted
          };
        }
        return issue;
      })
    );
    if (issueTitle) {
      triggerToast(
        isAlreadyVoted ? "Upvote Withdrawn 💔" : "Issue Upvoted 👍",
        isAlreadyVoted ? `Removed upvote from: "${issueTitle.slice(0, 20)}..."` : `You upvoted and backed: "${issueTitle.slice(0, 20)}..."`,
        id
      );
    }
  };

  // Add new issue local handler
  const handleAddIssue = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setUserStats((prev) => ({
      ...prev,
      points: prev.points + 50
    }));
    triggerToast(
      "Report Logged Successfully 🚨",
      `"${newIssue.title}" has been registered in the system under ${newIssue.department || 'Public Works'}.`,
      newIssue.id
    );
  };

  // Volunteer Claim
  const handleClaimMission = (id: string) => {
    let missionTitle = "";
    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          missionTitle = i.title;
          return { ...i, status: "In Progress", claimedByUserId: userStats.email };
        }
        return i;
      })
    );
    triggerToast(
      "Mission Claimed 🧹",
      `You registered as the active volunteer for: "${missionTitle || 'this mission'}".`,
      id
    );
  };

  // Volunteer Abandon
  const handleAbandonMission = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Pending", claimedByUserId: undefined } : i))
    );
    triggerToast("Mission Abandoned", "You have successfully withdrawn from this community duty.", id);
  };

  // Volunteer Resolve
  const handleResolveMission = (id: string, beforePhoto: string, afterPhoto: string, notes: string[]) => {
    const foundIssue = issues.find(i => i.id === id);
    if (!foundIssue) return;

    // Add user's submission
    const submission = {
      email: userStats.email,
      name: userStats.name,
      date: new Date().toISOString(),
      beforePhoto,
      afterPhoto,
      notes
    };

    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const completedList = [...(i.userCompletedList || []), userStats.email];
          const submissions = [...(i.evidenceSubmissions || []), submission];
          return {
            ...i,
            userCompletedList: completedList,
            evidenceSubmissions: submissions,
            afterPhoto: afterPhoto
          };
        }
        return i;
      })
    );

    // Add points
    setUserStats((prev) => ({
      ...prev,
      points: prev.points + 100,
      missionsCompleted: prev.missionsCompleted + 1
    }));

    triggerToast("Mission Completed! 🎉", "Your evidence was submitted and the AI is auditing the details...", id);

    // Call AI summarizer
    fetch("/api/gemini/summarize-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: foundIssue.title,
        category: foundIssue.category,
        description: foundIssue.description,
        notes: notes,
        actionItems: foundIssue.actionItems
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.summary) {
        setIssues(prev => prev.map(i => i.id === id ? { ...i, aiWorkSummary: data.summary, aiWorkKPIs: data.kpis } : i));
        triggerToast("AI Audited Completed Work ✅", data.summary.slice(0, 45) + "...", id);
      }
    })
    .catch(err => console.error("Error summarizing work done:", err));
  };

  // Local Fixer Resolve
  const handleResolveFixerJob = (id: string, beforePhoto: string, afterPhoto: string, notes: string[], qualityScore?: number) => {
    const foundIssue = issues.find(i => i.id === id);
    if (!foundIssue) return;

    // Add user's submission
    const submission = {
      email: userStats.email,
      name: userStats.name,
      date: new Date().toISOString(),
      beforePhoto,
      afterPhoto,
      notes
    };

    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const completedList = [...(i.userCompletedList || []), userStats.email];
          const submissions = [...(i.evidenceSubmissions || []), submission];
          return {
            ...i,
            userCompletedList: completedList,
            evidenceSubmissions: submissions,
            afterPhoto: afterPhoto,
            qualityScore: qualityScore
          };
        }
        return i;
      })
    );

    // Toast and background AI summarize
    triggerToast("Job Completed! 🛠️", "Contract completed! Escrow released. AI is summarizing workmanship...", id);

    // Call AI summarizer
    fetch("/api/gemini/summarize-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: foundIssue.title,
        category: foundIssue.category,
        description: foundIssue.description,
        notes: notes,
        actionItems: foundIssue.actionItems
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.summary) {
        setIssues(prev => prev.map(i => i.id === id ? { ...i, aiWorkSummary: data.summary, aiWorkKPIs: data.kpis } : i));
        triggerToast("AI Summary Logged ✅", data.summary.slice(0, 45) + "...", id);
      }
    })
    .catch(err => console.error("Error summarizing work done:", err));
  };

  // Local Fixer Claim
  const handleClaimFixerJob = (id: string) => {
    let jobTitle = "";
    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          jobTitle = i.title;
          return { ...i, status: "In Progress", claimedByUserId: userStats.email };
        }
        return i;
      })
    );
    triggerToast(
      "Fixer Gig Claimed 🛠️",
      `You are registered as the professional contractor for: "${jobTitle || 'this job'}".`,
      id
    );
  };

  // Local Fixer Abandon
  const handleAbandonFixerJob = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Pending", claimedByUserId: undefined } : i))
    );
    triggerToast("Job Abandoned", "You have successfully withdrawn from this contractor gig.", id);
  };

  // Admin Actions
  const handleAdminResolve = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Resolved" } : i))
    );
  };

  const handleAdminDelete = (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  // Reset demo states
  const handleResetApp = () => {
    setIssues(initialIssues);
    setUserStats(initialUserStats);
    setSelectedTab("Home");
    setMoreTabActive("");
    setShowMoreMenu(false);
  };

  // Dynamic Navigation controller
  const navigateToTab = (tabName: string) => {
    let targetTab = tabName;
    if (targetTab === "Settings" || targetTab === "Profile") {
      setSelectedTab("Profile");
      setMoreTabActive("");
      setShowMoreMenu(false);
      return;
    }
    const mainTabs = ["Home", "Feed", "Report"];
    if (mainTabs.includes(targetTab)) {
      setSelectedTab(targetTab);
      setMoreTabActive("");
      setShowMoreMenu(false);
    } else {
      setSelectedTab("More");
      setMoreTabActive(targetTab);
      setShowMoreMenu(false);
    }
  };

  // Render sub screen view inside emulator frame
  const renderScreenContent = () => {
    if (selectedTab === "Home") {
      return (
        <HomeView
          userStats={userStats}
          issues={issues}
          onNavigateToTab={navigateToTab}
          onUpvoteIssue={handleUpvoteIssue}
          onSelectIssue={setSelectedIssue}
          onToggleSaveIssue={handleToggleSaveIssue}
        />
      );
    }
    if (selectedTab === "Feed") {
      return (
        <FeedView
          issues={issues}
          onUpvoteIssue={handleUpvoteIssue}
          onSelectIssue={setSelectedIssue}
          onToggleSaveIssue={handleToggleSaveIssue}
          userStats={userStats}
          onUpdateUserStats={handleUpdateUserStats}
        />
      );
    }
    if (selectedTab === "Report") {
      return <ReportView onAddIssue={handleAddIssue} onNavigateToTab={navigateToTab} />;
    }
    if (selectedTab === "Profile") {
      return (
        <ProfileView
          userStats={userStats}
          issues={issues}
          onSelectIssue={setSelectedIssue}
          onNavigateToTab={navigateToTab}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onTriggerKotlinExplorer={() => setShowKotlinHub(true)}
          onResetApp={handleResetApp}
          onUpdateUserStats={handleUpdateUserStats}
          onAbandonMission={handleAbandonMission}
          onAbandonFixerJob={handleAbandonFixerJob}
          onDeleteIssue={handleAdminDelete}
        />
      );
    }
    if (selectedTab === "More") {
      if (moreTabActive === "Volunteer") {
        return (
          <VolunteerView
            userStats={userStats}
            issues={issues}
            onClaimMission={handleClaimMission}
            onAbandonMission={handleAbandonMission}
            onResolveMission={handleResolveMission}
            onUpdateUserStats={handleUpdateUserStats}
          />
        );
      }
      if (moreTabActive === "Fixer") {
        return (
          <FixerView
            userStats={userStats}
            issues={issues}
            onClaimFixerJob={handleClaimFixerJob}
            onAbandonFixerJob={handleAbandonFixerJob}
            onUpdateUserStats={handleUpdateUserStats}
            onDeleteIssue={handleAdminDelete}
            onResolveFixerJob={handleResolveFixerJob}
          />
        );
      }
      if (moreTabActive === "Dashboard") {
        return (
          <DashboardView 
            issues={issues} 
            userStats={userStats}
            onUpdateUserStats={handleUpdateUserStats}
          />
        );
      }
      if (moreTabActive === "CivicInfo") {
        return (
          <CivicInfoView
            userPoints={userStats.points}
            onUpdatePoints={(change) => {
              setUserStats((prev) => ({ ...prev, points: prev.points + change }));
            }}
            onBackToHome={() => navigateToTab("Home")}
          />
        );
      }
      if (moreTabActive === "Admin") {
        return (
          <AdminView
            issues={issues}
            onAdminResolve={handleAdminResolve}
            onAdminDelete={handleAdminDelete}
          />
        );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#4F46E5]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#6366F1]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Title logo outside phone */}
      <div className="mb-4 text-center select-none shrink-0 z-10 hidden md:block">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-lg font-black text-white shadow-lg">Q</span>
          CIVIQ
        </h1>
        <p className="text-[#818CF8] text-xs font-semibold tracking-wider uppercase mt-1">Community Hero — Bengaluru</p>
      </div>

      {/* SMARTPHONE FRAME CONTAINER */}
      <div
        className={`w-full max-w-[370px] h-[690px] rounded-[48px] bg-black p-[11px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[3px] border-slate-900 relative z-10 flex flex-col transition-all overflow-hidden ${
          darkMode ? "dark" : ""
        }`}
      >
        {/* Curved internal screen card */}
        <div className="flex-1 bg-white dark:bg-[#070B14] rounded-[38px] relative overflow-hidden flex flex-col">
          
          {/* Real-time Toast Push Notifications banner inside Safe Area */}
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 36, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                onClick={() => {
                  if (toast.title.includes("Deleted") && lastDeletedIssue) {
                    setIssues((prev) => [lastDeletedIssue, ...prev]);
                    setSelectedIssue(lastDeletedIssue);
                    setLastDeletedIssue(null);
                    triggerToast("Report Restored ↩️", `Successfully restored "${lastDeletedIssue.title.slice(0, 15)}".`, lastDeletedIssue.id);
                  } else {
                    const found = issues.find(i => i.id === toast.issueId);
                    if (found) {
                      setSelectedIssue(found);
                      navigateToTab("Feed");
                    }
                  }
                  setToast(null);
                }}
                className="absolute left-3 right-3 bg-slate-900/95 dark:bg-[#0E1524]/95 text-white p-3 rounded-2xl border border-indigo-950/40 shadow-2xl z-[100] flex gap-2.5 items-center cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-xs shadow-sm shrink-0">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">CIVIQ LIVE TRACK</span>
                    <span className="text-[8px] text-slate-400 font-semibold">Just now</span>
                  </div>
                  <h4 className="text-[10.5px] font-black text-white truncate mt-0.5">{toast.title}</h4>
                  <p className="text-[10px] text-slate-300 truncate font-semibold leading-relaxed">{toast.body}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* TOP NOTCH / PUNCH HOLE CAMERA */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-[#F0F4FF] dark:bg-[#070B14] z-50 flex items-center justify-between px-6 pointer-events-none">
            {/* Ticking Clock */}
            <span className="text-[10px] font-black text-slate-800 dark:text-white font-mono">{timeStr}</span>
            
            {/* Camera Bezel punch hole */}
            <div className="w-18 h-4 rounded-full bg-black flex items-center justify-center gap-1.5 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <div className="w-4 h-1 rounded-full bg-slate-900" />
            </div>

            {/* Status bars wifi battery */}
            <div className="flex items-center gap-1 text-slate-800 dark:text-white scale-[0.85]">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c3.9 3.89 10.21 3.89 14.1 0l-1.35-1.35C18.26 16.51 19 14.34 19 12c0-4.97-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
              </svg>
              <div className="w-4 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
                <div className="h-full w-[80%] bg-current rounded-2xs" />
              </div>
            </div>
          </div>

          {/* MAIN PHASES SCREEN CONTROLLER */}
          <div className="flex-1 pt-7 pb-14 relative overflow-hidden bg-[#F0F4FF] dark:bg-[#070B14]">
            {phase === "SPLASH" && <SplashView onComplete={() => setPhase("AUTH")} />}
            {phase === "AUTH" && <AuthView onLoginSuccess={handleLoginSuccess} />}
            {phase === "APP" && renderScreenContent()}
          </div>

          {/* BOTTOM NAVIGATION TAB BAR */}
          {phase === "APP" && (
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#F0F4FF]/95 dark:bg-[#070B14]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-indigo-950/80 z-40 flex justify-around items-center px-2 shadow-lg">
              <button
                onClick={() => navigateToTab("Home")}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                  selectedTab === "Home" ? "text-[#4F46E5] dark:text-[#818CF8]" : "text-slate-400"
                }`}
              >
                <Home className="w-4.5 h-4.5" />
                <span className="text-[8px] font-black mt-0.5 uppercase tracking-wider">Home</span>
              </button>

              <button
                onClick={() => navigateToTab("Feed")}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                  selectedTab === "Feed" ? "text-[#4F46E5] dark:text-[#818CF8]" : "text-slate-400"
                }`}
              >
                <Search className="w-4.5 h-4.5" />
                <span className="text-[8px] font-black mt-0.5 uppercase tracking-wider">Search</span>
              </button>

              <button
                onClick={() => navigateToTab("Report")}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                  selectedTab === "Report" ? "text-[#4F46E5] dark:text-[#818CF8]" : "text-slate-400"
                }`}
              >
                <PlusCircle className="w-5.5 h-5.5 text-[#4F46E5] dark:text-[#818CF8] hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black mt-0.5 uppercase tracking-wider">Report</span>
              </button>

              <button
                onClick={() => navigateToTab("Profile")}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                  selectedTab === "Profile" ? "text-[#4F46E5] dark:text-[#818CF8]" : "text-slate-400"
                }`}
              >
                <User className="w-4.5 h-4.5" />
                <span className="text-[8px] font-black mt-0.5 uppercase tracking-wider">Profile</span>
              </button>
            </div>
          )}

          {/* MULTI-PURPOSE DETAIL OVERLAY MODAL */}
          {selectedIssue && (
            <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fade-in">
              {/* Dismiss Area */}
              <div className="flex-1" onClick={() => setSelectedIssue(null)} />
              
              {/* Bottom Sheet Card details */}
              <div className="max-h-[85%] bg-[#F0F4FF] dark:bg-[#070B14] rounded-t-3xl overflow-y-auto p-5 border-t border-slate-200 dark:border-indigo-950 space-y-4 animate-slide-up text-slate-800 dark:text-slate-100">
                
                {/* Header title */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-[#4F46E5] dark:text-[#818CF8] bg-indigo-50 dark:bg-[#1B253D] px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                      {selectedIssue.category}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1.5">{selectedIssue.title}</h3>
                  </div>
                  <button onClick={() => setSelectedIssue(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-xs font-bold">✕</button>
                </div>

                {/* Severity Status bar */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black text-white ${
                      selectedIssue.severity === "Critical" ? "bg-rose-500" : selectedIssue.severity === "High" ? "bg-orange-500" : selectedIssue.severity === "Medium" ? "bg-[#EAB308]" : "bg-emerald-500"
                    }`}>
                      Severity: {selectedIssue.severity}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#1B253D] rounded-md text-[9px] font-black text-slate-500 dark:text-slate-400">
                      Status: {selectedIssue.status}
                    </span>
                  </div>

                  {/* Intuitive Reopen Option for Resolved Problems */}
                  {selectedIssue.status === "Resolved" && (
                    <button
                      onClick={() => {
                        const nextCount = (selectedIssue.reopenCount || 0) + 1;
                        const reopenComment = {
                          id: `reopen-${Date.now()}`,
                          author: "CIVIQ dispatcher 🚨",
                          text: `🚨 Citizen reopened this issue: "Problem has recurred at this spot." (Reopened count: ${nextCount}). Re-assigning to ${selectedIssue.department} with high priority.`,
                          date: "Just now"
                        };
                        const currentComments = getCommentsForIssue(selectedIssue);
                        const updatedComments = [reopenComment, ...currentComments];

                        setIssues((prev) =>
                          prev.map((i) =>
                            i.id === selectedIssue.id
                              ? { ...i, status: "In Progress", reopenCount: nextCount, comments: updatedComments }
                              : i
                          )
                        );
                        setSelectedIssue((prev) =>
                          prev ? { ...prev, status: "In Progress", reopenCount: nextCount, comments: updatedComments } : null
                        );
                        triggerToast("Issue Reopened 🚨", `Escalated to ${selectedIssue.department} engineers (Reopened count: ${nextCount}).`, selectedIssue.id);
                      }}
                      className="px-3 py-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 hover:text-rose-400 border border-rose-500/35 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95"
                    >
                      Reopen Resolved Problem ⚠️
                    </button>
                  )}

                  {/* Undo Reopen Option */}
                  {selectedIssue.status === "In Progress" && selectedIssue.reopenCount !== undefined && selectedIssue.reopenCount > 0 && (
                    <button
                      onClick={() => {
                        const nextCount = selectedIssue.reopenCount! - 1;
                        const currentComments = getCommentsForIssue(selectedIssue);
                        // Remove the top reopen comments (might be comments added recently, let's keep others)
                        const updatedComments = currentComments.slice(1);
                        const nextStatus = nextCount === 0 ? "Resolved" : "In Progress";

                        setIssues((prev) =>
                          prev.map((i) =>
                            i.id === selectedIssue.id
                              ? { ...i, status: nextStatus, reopenCount: nextCount, comments: updatedComments }
                              : i
                          )
                        );
                        setSelectedIssue((prev) =>
                          prev ? { ...prev, status: nextStatus, reopenCount: nextCount, comments: updatedComments } : null
                        );
                        triggerToast("Reopen Undone ↩️", `Reverted reopen dispatch. Status reset to ${nextStatus}.`, selectedIssue.id);
                      }}
                      className="px-3 py-1 bg-slate-600/15 hover:bg-slate-600/25 text-slate-700 dark:text-slate-300 border border-slate-500/35 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1"
                    >
                      Undo Reopen ↩️
                    </button>
                  )}
                </div>

                {/* Delete/Remove option for User Reported Posts */}
                {selectedIssue.isUserReported && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex justify-between items-center gap-2">
                    <div>
                      <span className="text-[9.5px] font-black text-rose-500 uppercase block tracking-wider">Your Filed Post</span>
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
                        You can permanently delete this report.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const backupIssue = { ...selectedIssue };
                        setLastDeletedIssue(backupIssue);
                        setIssues((prev) => prev.filter((i) => i.id !== selectedIssue.id));
                        setSelectedIssue(null);
                        
                        triggerToast(
                          "Report Removed", 
                          `Report "${backupIssue.title.slice(0, 15)}..." removed. Tap here to undo.`, 
                          ""
                        );
                      }}
                      className="px-3 py-1.5 bg-transparent border border-rose-600/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-xs"
                    >
                      <span>Withdraw Report</span>
                    </button>
                  </div>
                )}

                {/* Reopen Warning Banner */}
                {selectedIssue.reopenCount !== undefined && selectedIssue.reopenCount > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[10px] font-extrabold text-rose-500 flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>
                      ⚠️ Recurring Problem: This issue has been reopened <span className="underline font-black text-white">{selectedIssue.reopenCount} times</span>. Priority escalated in the municipal queue.
                    </span>
                  </div>
                )}

                {/* HORIZONTALLY DRAGGABLE EVIDENCE GALLERY */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Incident Evidence Gallery</span>
                  <div 
                    className="flex gap-2.5 overflow-x-auto pb-1.5 snap-x scrollbar-none select-none scroll-smooth touch-pan-x" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    {selectedIssueMediaList.map((media, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border border-slate-200/50 dark:border-indigo-950/40 bg-slate-900 flex-shrink-0 snap-center h-32 ${
                          selectedIssueMediaList.length === 1 ? "w-full" : "w-52"
                        }`}
                      >
                        {media.type === "video" ? (
                          <div className="relative w-full h-full">
                            {/* Play indicator */}
                            <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center z-10 text-white gap-1 p-2">
                              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shadow animate-pulse">
                                <Play className="w-4 h-4 fill-current text-white pl-0.5" />
                              </div>
                              <span className="text-[7.5px] font-black tracking-widest uppercase bg-black/60 px-1.5 py-0.5 rounded">Video Evidence</span>
                            </div>
                            <img 
                              src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80" 
                              alt="video preview" 
                              className="w-full h-full object-cover opacity-60"
                            />
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={media.label}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        
                        {/* Media label */}
                        <span className="absolute top-2 left-2 bg-black/65 backdrop-blur-3xs text-white text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded z-20">
                          {media.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main description text */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {selectedIssue.description}
                </p>

                {/* Location address */}
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedIssue.address}
                </span>

                {/* Citizen Video evidence player */}
                <VideoPlayer
                  videoUrl={selectedIssue.video}
                  address={selectedIssue.address}
                  latitude={selectedIssue.latitude}
                  longitude={selectedIssue.longitude}
                />

                {/* Like and Save Actions (Above Ward Process Tracking) */}
                <div className="flex gap-2.5 py-2">
                  <button
                    onClick={() => {
                      handleUpvoteIssue(selectedIssue.id);
                      setSelectedIssue((prev) => prev ? { ...prev, upvotes: prev.isVoted ? prev.upvotes - 1 : prev.upvotes + 1, isVoted: !prev.isVoted } : null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 border transition-all ${
                      selectedIssue.isVoted
                        ? "bg-[#4F46E5] text-white border-transparent"
                        : "bg-slate-50 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1B253D]"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${selectedIssue.isVoted ? "fill-current text-rose-500" : ""}`} />
                    <span>Like ({selectedIssue.upvotes})</span>
                  </button>

                  <button
                    onClick={() => {
                      handleToggleSaveIssue(selectedIssue.id);
                      setSelectedIssue((prev) => prev ? { ...prev, isSaved: !prev.isSaved } : null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 border transition-all ${
                      selectedIssue.isSaved
                        ? "bg-amber-600 text-white border-transparent"
                        : "bg-slate-50 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1B253D]"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${selectedIssue.isSaved ? "fill-current text-amber-500" : ""}`} />
                    <span>{selectedIssue.isSaved ? "Saved" : "Save Report"}</span>
                  </button>
                </div>

                {/* Process stages tracking timeline */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ward Process Tracking & Audit</span>
                  <ProcessTracker issue={selectedIssue} />
                </div>

                {/* AI Triaging details box */}
                <div className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black text-[#4F46E5] dark:text-[#818CF8] uppercase tracking-widest">Gemini AI Dispatch analysis</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Department Assigned</span>
                      <span className="font-bold">{selectedIssue.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Assigned SLA</span>
                      <span className="font-bold">{selectedIssue.sla} hours</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Recommended Resolution Steps:</span>
                  <ul className="space-y-1">
                    {selectedIssue.actionItems.map((item, idx) => (
                      <li key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold list-disc pl-1 ml-3">
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-[10px] font-bold text-amber-800 dark:text-amber-400 italic">
                    AI Urgency Reasoning: {selectedIssue.urgencyReason}
                  </div>
                </div>

                {/* Safety risk check bar */}
                {selectedIssue.safetyRisk && selectedIssue.status !== "Resolved" && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <Flame className="w-5 h-5 animate-pulse shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wide">
                      Urgent Public Injury Threat. Prioritized Emergency Clearance
                    </span>
                  </div>
                )}

                {/* Interactive comment block styled with a slightly dark background */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-100/60 dark:bg-[#04060A]/80 border border-slate-200/40 dark:border-indigo-950/20 shadow-sm mt-3 relative">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Discussions ({getCommentsForIssue(selectedIssue).length})</span>
                  
                  {/* Comments list */}
                  <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1 border border-dashed border-slate-200/80 dark:border-indigo-950/40 p-2.5 rounded-xl bg-white/40 dark:bg-[#080B14]/40">
                    {getCommentsForIssue(selectedIssue).length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic block text-center py-4">No comments on this issue yet. Start the discussion!</span>
                    ) : (
                      getCommentsForIssue(selectedIssue).map((comment) => {
                        const renderCommentNode = (c: Comment, depth: number = 0): React.ReactNode => {
                          const hasLiked = c.likedBy?.includes(userStats.name);
                          const isOwn = c.author === userStats.name;

                          return (
                            <div key={c.id} className="space-y-1 relative" style={{ marginLeft: depth > 0 ? `${Math.min(depth * 14, 40)}px` : '0px' }}>
                              <div className={`bg-white dark:bg-[#0E1524] rounded-xl p-2.5 border border-slate-150/60 dark:border-indigo-950/20 shadow-xs relative ${depth > 0 ? "border-l-2 border-l-indigo-500/40" : ""}`}>
                                <div className="flex gap-2 items-start">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 ${isOwn ? "bg-indigo-600 text-white" : "bg-teal-600 text-white"}`}>
                                    {c.author[0]}
                                  </div>
                                  <div className="flex-1 min-w-0 relative">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-1.5">
                                        <span className="block text-[9px] font-black text-slate-800 dark:text-slate-200">{c.author}</span>
                                        {isOwn && (
                                          <span className="text-[7px] font-black bg-indigo-500/10 text-[#4F46E5] dark:text-indigo-400 border border-indigo-500/10 px-1 py-0.2 rounded uppercase tracking-wider">You</span>
                                        )}
                                        {c.isEdited && (
                                          <span className="text-[7.5px] font-medium text-slate-400 italic">(edited)</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[7.5px] text-slate-400 font-mono">{c.date}</span>
                                        
                                        {/* 3 dots trigger */}
                                        <div className="relative">
                                          <button
                                            type="button"
                                            onClick={() => setActiveDropdownCommentId(activeDropdownCommentId === c.id ? null : c.id)}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-slate-600"
                                          >
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Dropdown Menu */}
                                          {activeDropdownCommentId === c.id && (
                                            <div className="absolute right-0 top-6 bg-white dark:bg-[#141C2E] border border-slate-200 dark:border-indigo-950/80 rounded-xl shadow-lg py-1 w-28 z-40 animate-fade-in text-[9.5px]">
                                              {isOwn ? (
                                                <>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setEditingCommentId(c.id);
                                                      setReplyingToCommentId(null);
                                                      setNewCommentText(c.text);
                                                      setActiveDropdownCommentId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                                                  >
                                                    ✏️ Edit
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleDeleteComment(c.id);
                                                      setActiveDropdownCommentId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-500 font-bold"
                                                  >
                                                    🗑️ Delete
                                                  </button>
                                                </>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    handleReportComment(c.id, c.author, c.text);
                                                    setActiveDropdownCommentId(null);
                                                  }}
                                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-700 dark:text-slate-300 font-bold"
                                                >
                                                  🛡️ Report Comment
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {c.isReported ? (
                                      <p className="text-[10px] text-rose-500 italic mt-0.5 font-bold flex items-center gap-1 bg-rose-500/5 p-1 rounded border border-rose-500/10">
                                        ⚠️ Reported for moderation.
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold">
                                        {c.text}
                                      </p>
                                    )}

                                    {/* Action buttons (Like, Reply) */}
                                    <div className="flex gap-3 mt-1.5 items-center">
                                      <button
                                        type="button"
                                        onClick={() => handleLikeComment(c.id)}
                                        className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider transition-all ${
                                          hasLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"
                                        }`}
                                      >
                                        <Heart className={`w-3 h-3 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                                        <span>{c.likes || 0} Likes</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingToCommentId(c.id);
                                          setEditingCommentId(null);
                                          setNewCommentText("");
                                        }}
                                        className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-400 hover:text-teal-500 transition-all"
                                      >
                                        <MessageSquare className="w-3 h-3" />
                                        <span>Reply</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Recursively Render Replies */}
                              {c.replies && c.replies.length > 0 && (
                                <div className="space-y-2 mt-2">
                                  {c.replies.map((reply) => renderCommentNode(reply, depth + 1))}
                                </div>
                              )}
                            </div>
                          );
                        };

                        return renderCommentNode(comment, 0);
                      })
                    )}
                  </div>

                  {/* Reply/Edit Active Labels */}
                  {replyingToCommentId && (
                    <div className="flex justify-between items-center bg-teal-600/10 border border-teal-500/25 px-3 py-1 rounded-xl text-[9.5px] text-teal-400 font-bold">
                      <span>Replying to {replyingToCommentId && findCommentById(getCommentsForIssue(selectedIssue), replyingToCommentId)?.author}'s comment</span>
                      <button
                        type="button"
                        onClick={() => setReplyingToCommentId(null)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {editingCommentId && (
                    <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-xl text-[9.5px] text-amber-400 font-bold">
                      <span>✏️ Editing your update comment</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null);
                          setNewCommentText("");
                        }}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Add comment Form */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={
                        replyingToCommentId 
                          ? "Write a nested reply..." 
                          : editingCommentId 
                          ? "Edit your update text..." 
                          : "Add neighborhood update or comment..."
                      }
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment();
                      }}
                      className="flex-1 px-3 h-9 bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-indigo-950 rounded-xl text-[10.5px] focus:outline-none focus:border-[#4F46E5] text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={handleAddComment}
                      className="h-9 px-3.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-[10px] rounded-xl active:scale-95 transition-all"
                    >
                      {editingCommentId ? "Save" : replyingToCommentId ? "Reply" : "Post"}
                    </button>
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="w-full h-11 bg-slate-100 dark:bg-[#1B253D] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs rounded-xl active:scale-95 transition-all"
                  >
                    Close Details
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* KOTLIN CODE HUB EXPLORER */}
          {showKotlinHub && <KotlinExplorer onClose={() => setShowKotlinHub(false)} />}

        </div>
      </div>

      {/* Floating platform credit badge */}
      <div className="mt-4 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-widest select-none max-w-[320px] leading-relaxed">
        Swipe phone tabs to test workflows. Touch and edit code using the sidebar explorer.
      </div>

    </div>
  );
}
