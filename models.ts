export interface IExecutionState {
  averageDuration: number;
  currentDuration: number;
  endStamp: number;
  errors: number;
  executions: IExecutionItem[];
  lastExecution?: IExecutionItem;
  requestWaiting: boolean;
  startStamp: number;
  success: number;
}

export interface IExecutionItem {
  id: string;
  endStamp: number;
  httpStatusCode: number;
  totalDuration: number;
  startStamp: number;
}
