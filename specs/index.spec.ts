import ManagedTimers from '../source';

describe('should work as expected', () => {
  const managedTimers = new ManagedTimers();

  // wrap all timers to the managed ones
  managedTimers.manageAllTimers();

  it('will run the function supplied to setImmediate and clean up responsibly', async () => {
    await expect(
      new Promise<null>(resolve => {
        setImmediate(() => {
          resolve(null);
        });
      })
    ).resolves.toBeDefined();

    // check the timer record
    expect(managedTimers.immediateTimers.size).toEqual(1);
    managedTimers.clearImmediate();
    expect(managedTimers.immediateTimers.size).toEqual(0);
  });

  it('will run the function supplied to setInterval and clean up responsibly', async () => {
    const startTime = Date.now();
    await expect(
      new Promise<number>(resolve => {
        setInterval(() => {
          resolve(Date.now());
        }, 1000);
      })
    ).resolves.toBeGreaterThanOrEqual(startTime + 1000);

    // check the timer record
    expect(managedTimers.intervalTimers.size).toEqual(1);
    managedTimers.clearInterval();
    expect(managedTimers.intervalTimers.size).toEqual(0);
  });

  it('will run the function supplied to setTimeout and clean up responsibly', async () => {
    const startTime = Date.now();
    const timeout = 1000;
    await expect(
      new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(Date.now());
        }, timeout);
      })
    ).resolves.toBeGreaterThanOrEqual(startTime + timeout);

    // check the timer record
    expect(managedTimers.timeoutTimers.size).toEqual(1);
    managedTimers.clearTimeout();
    expect(managedTimers.timeoutTimers.size).toEqual(0);
  });

  afterAll(managedTimers.resetAllTimers);
});
