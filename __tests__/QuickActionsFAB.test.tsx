import React from 'react';
import renderer from 'react-test-renderer';
import { QuickActionsFAB } from '../src/components/quick-actions';
import { defaultQuickActions } from '../src/config/quick-actions/quickActions.config';

describe('QuickActionsFAB', () => {
  it('renders closed state', () => {
    const tree = renderer.create(<QuickActionsFAB actions={defaultQuickActions} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
