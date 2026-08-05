export interface WorkspaceContext {
  activePath?: string;
  openFiles: string[];
}

export class WorkspaceManager {
  static getActiveWorkspace(): WorkspaceContext {
    return {
      openFiles: [],
    };
  }
}
