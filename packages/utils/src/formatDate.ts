import {
  formatDistanceToNow,
  format,
  isWithinInterval,
  subDays,
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
