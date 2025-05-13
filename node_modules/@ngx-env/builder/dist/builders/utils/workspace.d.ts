import { Tree } from '@angular-devkit/schematics';
export interface WorkspaceProject {
    projectType?: string;
    architect?: Record<string, {
        builder: string;
        options?: Record<string, any>;
    }>;
}
export interface Workspace {
    defaultProject?: string;
    projects: Record<string, WorkspaceProject>;
}
export declare function getWorkspace(host: Tree): {
    path: string;
    workspace: Workspace;
};
