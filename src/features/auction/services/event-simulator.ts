

export type SimulatorState = "idle" | "running" | "paused";

export interface SimulatorControls {
  state: SimulatorState;
  /** Start generating competitor activity for tracked auctions. */
  start(): void;
  /** Stop all activity and timers. */
  stop(): void;
  pause(): void;
  resume(): void;
  /** Fire exactly one competitor bid on the given auction (deterministic). */
  triggerBid(auctionId: string): Promise<boolean>;
  /** Force an auction to end now (demo control). */
  forceEnd(auctionId: string): boolean;
  /** Reset mock state to seeded fixtures. */
  resetState(): void;
  /** Simulate a reconnect cycle (fires status callbacks). */
  simulateReconnect(): void;
  onStateChange(cb: (state: SimulatorState) => void): () => void;
}

export interface SimulatorStatus {
  state: SimulatorState;
  /** "live" | "reconnecting" | "paused" as surfaced to the UI. */
  connection: "live" | "reconnecting" | "paused";
}

export interface EventSimulatorOptions {
  /** Fixed interval between auto competitor bids (ms). 0 = no auto loop. */
  intervalMs?: number;
  /** Jitter added to the base interval (ms). */
  jitterMs?: number;
  /** Random source; injectable for tests. */
  random?: () => number;
}

/**
 * Explicit controller for simulated competing-bidder activity.
 * Started/stopped at well-defined lifecycle boundaries (never during render),
 * and fully cleanable. This is NOT real network streaming — it only calls
 * service hooks that emit in-process events.
 */
export class EventSimulator implements SimulatorControls {
  state: SimulatorState = "idle";
  connection: SimulatorStatus["connection"] = "paused";

  private readonly intervalMs: number;
  private readonly jitterMs: number;
  private readonly random: () => number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private tracked = new Set<string>();
  private stateListeners = new Set<(s: SimulatorState) => void>();

  constructor(
    private readonly service: {
      placeSimulatedBid(auctionId: string): Promise<boolean>;
      forceEnd(auctionId: string): boolean;
      reset(): void;
    },
    options: EventSimulatorOptions = {}
  ) {
    this.intervalMs = options.intervalMs ?? 0;
    this.jitterMs = options.jitterMs ?? 0;
    this.random = options.random ?? Math.random;
  }

  /** Register an auction as "currently viewed" so the loop can target it. */
  track(auctionId: string): void {
    this.tracked.add(auctionId);
  }

  untrack(auctionId: string): void {
    this.tracked.delete(auctionId);
  }

  start(): void {
    if (this.state === "running") return;
    this.state = "running";
    this.connection = "live";
    this.notify();
    if (this.intervalMs > 0) this.scheduleNext();
  }

  stop(): void {
    this.clearTimer();
    this.state = "idle";
    this.connection = "paused";
    this.notify();
  }

  pause(): void {
    if (this.state !== "running") return;
    this.clearTimer();
    this.state = "paused";
    this.connection = "paused";
    this.notify();
  }

  resume(): void {
    if (this.state !== "paused") return;
    this.state = "running";
    this.connection = "live";
    this.notify();
    if (this.intervalMs > 0) this.scheduleNext();
  }

  async triggerBid(auctionId: string): Promise<boolean> {
    return this.service.placeSimulatedBid(auctionId);
  }

  forceEnd(auctionId: string): boolean {
    return this.service.forceEnd(auctionId);
  }

  resetState(): void {
    this.service.reset();
  }

  simulateReconnect(): void {
    // Brief "reconnecting" flash, then back to the current running state.
    const previous = this.state;
    this.connection = "reconnecting";
    this.notify();
    setTimeout(() => {
      this.connection =
        previous === "running" ? "live" : "paused";
      this.notify();
    }, 900);
  }

  onStateChange(cb: (state: SimulatorState) => void): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  private scheduleNext(): void {
    this.clearTimer();
    if (this.state !== "running") return;
    const jitter = this.jitterMs > 0
      ? Math.floor(this.random() * this.jitterMs)
      : 0;
    this.timer = setTimeout(() => {
      void this.tick();
    }, this.intervalMs + jitter);
  }

  private async tick(): Promise<void> {
    if (this.state !== "running") return;
    const targets = Array.from(this.tracked);
    if (targets.length > 0) {
      const auctionId = targets[Math.floor(this.random() * targets.length)];
      try {
        await this.service.placeSimulatedBid(auctionId);
      } catch {
        // simulator must never crash the app
      }
    }
    this.scheduleNext();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private notify(): void {
    for (const cb of Array.from(this.stateListeners)) {
      try {
        cb(this.state);
      } catch {
        // ignore listener errors
      }
    }
  }
}
