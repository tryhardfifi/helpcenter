/**
 * Convert timestamp to human-readable relative time
 * Examples: "just now", "5 min ago", "2 hours ago", "3 days ago", "Jan 15, 2024"
 *
 * @param {Date|string|number} timestamp - The timestamp to format
 * @returns {string} Human-readable relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Handle invalid dates
  if (isNaN(date.getTime())) return '';

  const seconds = Math.floor((now - date) / 1000);

  // Less than a minute
  if (seconds < 60) return 'just now';

  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  // Less than a month
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // More than a month - show actual date
  const options = {
    month: 'short',
    day: 'numeric'
  };

  // Add year if it's not the current year
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString('en-US', options);
};
