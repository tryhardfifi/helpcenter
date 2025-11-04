// Reusable color scheme for charts and visualizations

// Primary company colors
export const COMPANY_COLORS = {
  own: '#000000',        // Black for your company
  primary: '#000000',     // Same as own, for consistency
};

// Competitor colors - vibrant and distinct palette
export const COMPETITOR_COLORS = [
  '#0A66C2',  // Blue
  '#FF4500',  // Red-Orange
  '#00AB6C',  // Green
  '#FF6600',  // Orange
  '#DA552F',  // Burnt Orange
  '#8B5CF6',  // Purple
  '#EC4899',  // Pink
  '#F59E0B',  // Amber
];

// Domain/Source specific colors (for Sources page)
export const DOMAIN_COLORS = {
  'acme.com': '#000000',
  'reddit': '#FF4500',
  'techcrunch': '#0A66C2',
  'ycombinator': '#FF6600',
  'medium': '#00AB6C',
  'producthunt': '#DA552F',
  default: '#666666',
};

// Get color for a specific competitor by index
export const getCompetitorColor = (index) => {
  return COMPETITOR_COLORS[index % COMPETITOR_COLORS.length];
};

// Get color for bar chart - your company vs competitors
export const getBarColor = (isOwn, index = 0) => {
  return isOwn ? COMPANY_COLORS.own : getCompetitorColor(index);
};

// Get color for domain (used in Sources page)
export const getDomainColor = (domain) => {
  const lowerDomain = domain.toLowerCase();

  if (lowerDomain.includes('acme.com')) return DOMAIN_COLORS['acme.com'];
  if (lowerDomain.includes('reddit')) return DOMAIN_COLORS['reddit'];
  if (lowerDomain.includes('techcrunch')) return DOMAIN_COLORS['techcrunch'];
  if (lowerDomain.includes('ycombinator')) return DOMAIN_COLORS['ycombinator'];
  if (lowerDomain.includes('medium')) return DOMAIN_COLORS['medium'];
  if (lowerDomain.includes('producthunt')) return DOMAIN_COLORS['producthunt'];

  return DOMAIN_COLORS.default;
};

// Get color for line charts (similar to bar charts but can be different if needed)
export const getLineColor = (dataKey, index = 0) => {
  if (dataKey === 'acme' || dataKey === 'own') {
    return COMPANY_COLORS.own;
  }
  return getCompetitorColor(index);
};
