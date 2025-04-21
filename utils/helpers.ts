// Utility functions for the app

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
};

export const parseBulletPoints = (text: string): string[] => {
  if (!text.trim()) return [];
  
  // Split by newline
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove bullet point markers (•, -, *, etc.) from the beginning of each line
      return line.replace(/^[•\-\*\+\>\◦\‣\⁃\⦿\⦾\⁌\⁍\⧫\⬧\⬢\⬣\⭗\⭘\⬤\○\◎\◉\◌\◍\◆\◇\◈\◘\◙\◚\◛\◜\◝\◞\◟\◠\◡\◢\◣\◤\◥\◦\◧\◨\◩\◪\◫\◬\◭\◮\◯\◰\◱\◲\◳\◴\◵\◶\◷\◸\◹\◺\◻\◼\◽\◾\◿]+\s*/, '');
    });
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getRandomColor = (): string => {
  const colors = [
    '#4299E1', // blue
    '#48BB78', // green
    '#ED8936', // orange
    '#9F7AEA', // purple
    '#F56565', // red
    '#38B2AC', // teal
    '#ED64A6', // pink
    '#ECC94B', // yellow
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

export const calculateDaysLeft = (dueDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const formatDaysLeft = (days: number): string => {
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
};