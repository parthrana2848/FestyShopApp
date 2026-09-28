import React from 'react';
import { Section } from '../../types/section';
import { BannerSection } from './BannerSection';
import { GridSection } from './GridSection';
import { HorizontalListSection } from './HorizontalListSection';

interface SectionRendererProps {
  section: Section;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  // If we had dynamic data sources, we would ideally pass the section to a custom hook 
  // to fetch the specific data or handle it upstream. 
  // Given instructions: "If dataSource.type = dynamic, assume backend controls items".
  // This means the items array provided in the JSON is what we render regardless of mode.

  switch (section.type) {
    case 'banner':
      return <BannerSection section={section} />;
    case 'grid':
      return <GridSection section={section} />;
    case 'horizontal_list':
      return <HorizontalListSection section={section} />;
    default:
      console.warn(`Unknown section type encountered: ${section.type}`);
      return null;
  }
};

// Use React.memo as recommended in react-native.mdc to avoid unnecessary re-renders
export default React.memo(SectionRenderer);
