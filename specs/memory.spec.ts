import { iterate } from 'leakage';

import ManagedTimers from '../source';

interface LeakTestOptions {
  description: string;
  fn: () => void;
  shouldPass: boolean;
}

function leakTest(options: LeakTestOptions) {
  it(
    options.description,
    async (): Promise<void> => {
      const result = expect(
        iterate.async(async (): Promise<void> => {
          return new Promise<void>(resolve => {
            options.fn();

            // return in next tick only to allow the timer to be removed
            process.nextTick(resolve);
          });
        })
      );

      return result[options.shouldPass ? 'resolves' : 'rejects'].toBeDefined();
    },
    60000 // set a long timeout for this long running test
  );
}

describe('should not leak over usage', () => {
  const managedTimers = new ManagedTimers();

  // wrap all timers to the managed ones
  managedTimers.manageAllTimers();

  // clear up after each test
  afterEach(managedTimers.clearAllTimers);

  leakTest({
    description: 'should be fine with immediate',
    fn: () => {
      for (let i = 0; i < 100; i++) {
        setImmediate(() => {});
      }
      managedTimers.clearImmediate();
    },
    shouldPass: true
  });

  leakTest({
    description: 'should be fine with interval',
    fn: () => {
      for (let i = 0; i < 100; i++) {
        setInterval(() => {}, 1000);
      }
      managedTimers.clearInterval();
    },
    shouldPass: true
  });

  leakTest({
    description: 'should be fine with timeout',
    fn: () => {
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {}, 1000);
      }
      managedTimers.clearTimeout();
    },
    shouldPass: true
  });

  leakTest({
    description:
      'should see memory being leaked due to the uncleared immediates',
    fn: () => {
      for (let i = 0; i < 100; i++) {
        setImmediate(() => {});
      }
    },
    shouldPass: false
  });

  leakTest({
    description:
      'should see memory being leaked due to the uncleared intervals',
    fn: () => {
      for (let i = 0; i < 100; i++) {
        setInterval(() => {}, 1000);
      }
    },
    shouldPass: false
  });

  leakTest({
    description: 'should see memory being leaked due to the uncleared timeouts',
    fn: () => {
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {}, 1000);
      }
    },
    shouldPass: false
  });
});
