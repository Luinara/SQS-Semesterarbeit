import { render } from '@testing-library/react';
import App from '../../frontend/src/App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
