import React from 'react';
import renderer from 'react-test-renderer';
import QuickActionBackdrop from '../src/components/quick-actions/QuickActionBackdrop';

describe('QuickActionBackdrop', () => {
  it('renders when visible', () => {
    const tree = renderer.create(<QuickActionBackdrop visible={true} onRequestClose={() => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
