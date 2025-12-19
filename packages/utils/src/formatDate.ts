import {
  formatDistanceToNow,
  format,
  isWithinInterval,
  subDays,
  isToday,
  isYesterday,
} from "date-fns";
import { vi } from "date-fns/locale";

export const formatPostDate = (createdAt: string) => {
  if (!createdAt) return "Vừa xong";

  const postDate = new Date(createdAt);
  const now = new Date();
  const oneWeekAgo = subDays(now, 7);

  // Nếu bài đăng trong vòng 1 tuần
  if (isWithinInterval(postDate, { start: oneWeekAgo, end: now })) {
    return formatDistanceToNow(postDate, {
      addSuffix: true,
      locale: vi,
    });
  }

  // Nếu quá 1 tuần, hiển thị ngày tháng năm
  return format(postDate, "dd/MM/yyyy", { locale: vi });
};

// Format time
export const formatMessageTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return `Hôm qua ${format(date, "HH:mm")}`;
  }
  return format(date, "dd/MM HH:mm");
};
