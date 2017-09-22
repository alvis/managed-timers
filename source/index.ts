import bind from 'bind-decorator';
import * as genuineTimers from 'timers';

export class ManagedTimers {
  public immediateTimers: Set<NodeJS.Timer>;
  public intervalTimers: Set<NodeJS.Timer>;
  public timeoutTimers: Set<NodeJS.Timer>;

  constructor() {
    this.immediateTimers = new Set<NodeJS.Timer>();
    this.intervalTimers = new Set<NodeJS.Timer>();
    this.timeoutTimers = new Set<NodeJS.Timer>();
  }

  @bind
  public clearAllTimers() {
    this.clearImmediate();
    this.clearInterval();
    this.clearTimeout();
  }

  @bind
  public clearImmediate(timer?: NodeJS.Timer): void {
    if (timer !== undefined) {
      // clear the specified timer
      genuineTimers.clearImmediate(timer);
      this.immediateTimers.delete(timer);
    } else {
      // clear all timers
      for (const timer of Array.from(this.immediateTimers)) {
        this.clearImmediate(timer);
      }
    }
  }

  @bind
  public clearInterval(timer?: NodeJS.Timer): void {
    if (timer !== undefined) {
      // clear the specified timer
      genuineTimers.clearInterval(timer);
      this.intervalTimers.delete(timer);
    } else {
      // clear all timers
      for (const timer of Array.from(this.intervalTimers)) {
        this.clearInterval(timer);
      }
    }
  }

  @bind
  public clearTimeout(timer?: NodeJS.Timer): void {
    if (timer !== undefined) {
      // clear the specified timer
      genuineTimers.clearTimeout(timer);
      this.timeoutTimers.delete(timer);
    } else {
      // clear all timers
      for (const timer of Array.from(this.timeoutTimers)) {
        this.clearTimeout(timer);
      }
    }
  }

  @bind
  public manageAllTimers() {
    global.setImmediate = this.setImmediate;
    global.clearImmediate = this.clearImmediate;
    global.setInterval = this.setInterval;
    global.clearInterval = this.clearInterval;
    global.setTimeout = this.setTimeout;
    global.clearTimeout = this.clearTimeout;
  }

  @bind
  public resetAllTimers() {
    // clear all timers
    this.clearAllTimers();

    // restore the global timers to the original one
    global.setImmediate = genuineTimers.setImmediate;
    global.clearImmediate = genuineTimers.clearImmediate;
    global.setInterval = genuineTimers.setInterval;
    global.clearInterval = genuineTimers.clearInterval;
    global.setTimeout = genuineTimers.setTimeout;
    global.clearTimeout = genuineTimers.clearTimeout;
  }

  @bind
  public setImmediate(
    callback: (...args: any[]) => void,
    ...args: any[]
  ): NodeJS.Timer {
    const timer = genuineTimers.setImmediate(callback, ...args);
    this.immediateTimers.add(timer);
    return timer;
  }

  @bind
  public setInterval(
    callback: (...args: any[]) => void,
    ms: number,
    ...args: any[]
  ): NodeJS.Timer {
    const timer = genuineTimers.setInterval(callback, ms, ...args);
    this.intervalTimers.add(timer);
    return timer;
  }

  @bind
  public setTimeout(
    callback: (...args: any[]) => void,
    ms: number,
    ...args: any[]
  ): NodeJS.Timer {
    const timer = genuineTimers.setTimeout(callback, ms, ...args);
    this.timeoutTimers.add(timer);
    return timer;
  }
}

export default ManagedTimers;
