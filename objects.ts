import { IExecutionState, IExecutionItem } from "./models";
const urlHelper = require("url");

class ExecutionItem {
  private item: IExecutionItem;
  constructor() {
    this.item = this.newItem();
    return this;
  };

  private newItem = (): IExecutionItem => ({
    endStamp: 0,
    id: uniqid(),
    httpStatusCode: 0,
    startStamp: Date.now(),
    totalDuration: 0,
  });

  public end(): IExecutionItem {
    this.item.endStamp = Date.now();
    this.item.totalDuration = this.item.endStamp - this.item.startStamp;
    return this.item;
  }
}

class ExecutionState {
  private state: IExecutionState;
  constructor() {
    this.state = this.newState();
    return this;
  }

  private newState = (): IExecutionState => ({
    averageDuration: 0,
    currentDuration: 0,
    endStamp: 0,
    errors: 0,
    executions: [],
    requestWaiting: false,
    startStamp: 0,
    success: 0,
  });

  private averageDuration(): number {
    if (this.state.executions.length === 0) return 0;
    return this.state.executions.reduce((total: number, { totalDuration }: IExecutionItem) => {
      return total + totalDuration;
    }, 0) / this.state.executions.length;
  }

  public start(): ExecutionState {
    this.state.startStamp = Date.now();
    this.state.requestWaiting;
    return this;
  }

  public isRequestInProgress(): boolean {
    return this.state.requestWaiting;
  }

  public end(): IExecutionState {
    this.state.requestWaiting = false;
    this.state.endStamp = Date.now();
    this.state.averageDuration = this.averageDuration();
    return this.state;
  };

}

class Execution {
  private url: typeof urlHelper.URL;
  private options: any;//typeof NomnomInternal.Parser;
  private status: ExecutionState;

  constructor(url: typeof urlHelper.URL, options: any) { // typeof opts
    this.options = options;
    this.status = new ExecutionState();
    return this;
  }

  public start() {
    return this;
  }

  public end(): IExecutionState {
    return this.status.end();
  };
}
